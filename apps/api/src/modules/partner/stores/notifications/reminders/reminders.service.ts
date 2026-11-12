import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { setTimeout as sleep } from 'timers/promises';
import { Repository } from 'typeorm';
import {
  storeTimeToDate,
  toDateKey,
} from '../../../../../utils/helpers/schedule.helpers';
import { getStoreTimezone } from '../../../../../utils/helpers/region.helpers';
import { NotificationService } from '../../../../notification/notification.service';
import { PlanFeatureGuard } from '../../guards';
import {
  buildCustomerEmailData,
  getBookingPrice,
  getSchedulePrice,
} from '../../schedule/schedule.helpers';
import { Schedule } from '../../schedule/schedule.entity';
import type { Store } from '../../store.entity';
import { buildPresencePayloads } from '../../schedule/schedule-presence.helpers';
import {
  WHATSAPP_REMINDER_TEMPLATE,
  buildReminderTemplateParams,
  toWhatsappRecipient,
} from '../../whatsapp/whatsapp-reminder-template';
import { WHATSAPP_CONFIRMATION_REMINDER_TEMPLATE } from '../../whatsapp/whatsapp-templates';
import { WhatsappService } from '../../whatsapp/whatsapp.service';
import { NotificationsHistory } from '../history/history.entity';
import { NotificationsHistoryService } from '../history/history.service';
import type { NotificationsSettings } from '../settings/settings.entity';
import {
  SCHEDULE_REMINDER_ATTEMPTS,
  ScheduleReminder,
  TScheduleReminderChannel,
} from './schedule-reminder.entity';
import type { TStoreReminderTemplate } from './reminders.types';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const DEFAULT_ADVANCE_HOURS = 24;
// Acima do maior valor do painel (72h): antecedência maior só encurta o aviso
const SEARCH_HORIZON_HOURS = 72;
// Limite do Resend e duração da função: o que sobrar sai na execução seguinte
const MAX_SENDS_PER_RUN = 50;
const EMAIL_SEND_INTERVAL_MS = 600;
// A Meta aceita dezenas por segundo; o intervalo só evita rajada no mesmo número
const WHATSAPP_SEND_INTERVAL_MS = 200;

type TReminderResult = { sent: number; failed: number };

type TReminderChannelConfig = {
  channel: TScheduleReminderChannel;
  sendIntervalMs: number;
  historyLabel: string;
  advanceOf: (settings: NotificationsSettings) => string | undefined;
  recipientOf: (schedule: Schedule) => string | null;
  isStoreReady?: (store: Store) => Promise<boolean>;
  send: (schedule: Schedule, recipient: string) => Promise<unknown>;
};

const parseAdvanceHours = (value?: string) => {
  const match = value?.trim().match(/^(\d+)\s*h?$/i);

  return match ? Number(match[1]) : DEFAULT_ADVANCE_HOURS;
};

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(ScheduleReminder)
    private readonly reminderRepository: Repository<ScheduleReminder>,
    private readonly notificationsHistoryService: NotificationsHistoryService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly whatsappService: WhatsappService,
    private readonly planFeatureGuard: PlanFeatureGuard,
  ) {}

  /** Um canal com erro não impede o outro de sair na mesma execução. */
  async sendDueReminders(now = new Date()) {
    const run = async (
      channel: string,
      task: () => Promise<TReminderResult>,
    ) => {
      try {
        return await task();
      } catch (error) {
        this.logger.error(
          `Lembretes por ${channel} não processados`,
          error instanceof Error ? error.stack : undefined,
        );
        return null;
      }
    };

    return {
      email: await run('e-mail', () => this.sendDueEmailReminders(now)),
      whatsapp: await run('WhatsApp', () => this.sendDueWhatsappReminders(now)),
    };
  }

  async sendDueEmailReminders(now = new Date()) {
    return this.deliver(now, await this.findCandidates(now, 'email'), {
      channel: 'email',
      sendIntervalMs: EMAIL_SEND_INTERVAL_MS,
      historyLabel: 'Lembrete do agendamento',
      advanceOf: (settings) => settings.emailReminderAdvanceHours,
      recipientOf: (schedule) => schedule.user.email || null,
      send: (schedule, email) => this.sendEmail(schedule, email),
    });
  }

  async sendDueWhatsappReminders(now = new Date()) {
    // Uma consulta de plano e de template por loja em cada execução
    const templates = new Map<string, Promise<TStoreReminderTemplate | null>>();
    const templateOf = (store: Store) => {
      if (!templates.has(store.id)) {
        templates.set(store.id, this.findStoreReminderTemplate(store));
      }
      return templates.get(store.id);
    };

    return this.deliver(now, await this.findCandidates(now, 'whatsapp'), {
      channel: 'whatsapp',
      sendIntervalMs: WHATSAPP_SEND_INTERVAL_MS,
      historyLabel: 'Lembrete por WhatsApp do agendamento',
      advanceOf: (settings) => settings.whatsappReminderAdvanceHours,
      recipientOf: (schedule) =>
        toWhatsappRecipient(schedule.user.telephone, schedule.store.country),
      isStoreReady: async (store) => Boolean(await templateOf(store)),
      send: async (schedule, phone) =>
        this.sendWhatsapp(schedule, phone, await templateOf(schedule.store)),
    });
  }

  private async deliver(
    now: Date,
    schedules: Schedule[],
    config: TReminderChannelConfig,
  ) {
    const result: TReminderResult = { sent: 0, failed: 0 };
    let attemptedSends = 0;

    for (const schedule of schedules) {
      if (attemptedSends === MAX_SENDS_PER_RUN) break;

      const recipient = config.recipientOf(schedule);
      if (!recipient || !this.isDue(schedule, now, config)) continue;
      if (config.isStoreReady && !(await config.isStoreReady(schedule.store))) {
        continue;
      }

      const claim = await this.claim(schedule, config.channel);
      if (!claim) continue;

      if (attemptedSends > 0) await sleep(config.sendIntervalMs);
      attemptedSends += 1;

      const status = await this.send(schedule, recipient, config);
      result[status] += 1;

      // Marca antes do histórico: uma falha ao gravá-lo não pode reenviar o lembrete
      await this.reminderRepository.update({ id: claim.id }, { status });

      if (status === 'sent' || claim.attempts >= SCHEDULE_REMINDER_ATTEMPTS) {
        await this.recordHistory(schedule, recipient, status, now, config);
      }
    }

    return result;
  }

  /** O filtro exato depende do fuso da loja, então a consulta só limita por dia. */
  private findCandidates(now: Date, channel: TScheduleReminderChannel) {
    const from = new Date(now.getTime() - DAY_MS);
    const to = new Date(
      now.getTime() + SEARCH_HORIZON_HOURS * HOUR_MS + DAY_MS,
    );

    const query = this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.user', 'user')
      .innerJoinAndSelect('schedule.store', 'store')
      .innerJoinAndSelect('store.notificationsSettings', 'settings')
      .leftJoinAndSelect('schedule.service', 'service')
      .leftJoinAndSelect('schedule.storeMember', 'storeMember')
      .leftJoinAndSelect('storeMember.user', 'memberUser');

    if (channel === 'whatsapp') {
      query
        .innerJoinAndSelect(
          'store.whatsappConfig',
          'whatsapp',
          'whatsapp.isActive = true',
        )
        .where('settings.whatsappReminderEnabled = true');
    } else {
      query.where('settings.emailReminderEnabled = true');
    }

    return query
      .andWhere('store.isDeleted IS NOT TRUE')
      .andWhere("schedule.status = 'scheduled'")
      .andWhere('schedule.date BETWEEN :from AND :to', {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      })
      .orderBy('schedule.date', 'ASC')
      .addOrderBy('schedule.startTime', 'ASC')
      .getMany();
  }

  private isDue(schedule: Schedule, now: Date, config: TReminderChannelConfig) {
    if (!schedule.date || !schedule.startTime) return false;

    try {
      const startsAt = storeTimeToDate(
        toDateKey(schedule.date),
        schedule.startTime,
        getStoreTimezone(schedule.store),
      ).getTime();
      const advanceHours = parseAdvanceHours(
        config.advanceOf(schedule.store.notificationsSettings),
      );

      return (
        startsAt - advanceHours * HOUR_MS <= now.getTime() &&
        now.getTime() < startsAt
      );
    } catch (error) {
      // O fuso é texto livre: um valor inválido não pode parar as outras lojas
      this.logger.error(
        `Agendamento ${schedule.id} ignorado: ${(error as Error).message}`,
      );
      return false;
    }
  }

  /**
   * O plano pode ter caído depois de o lembrete ser ligado, e a Meta só entrega
   * com o template aprovado. Sem isso o lembrete nem é reservado: sai quando der.
   */
  private async findStoreReminderTemplate(
    store: Store,
  ): Promise<TStoreReminderTemplate | null> {
    try {
      const missing = await this.planFeatureGuard.getMissingFeatures(store.id, [
        'WHATSAPP_INTEGRATION',
      ]);
      if (missing.length) return null;

      const template = await this.whatsappService.findReminderTemplate(
        store.whatsappConfig,
      );
      if (template.status !== 'APPROVED') {
        this.logger.warn(
          `Loja ${store.id} sem template de lembrete aprovado (${template.status})`,
        );
        return null;
      }

      const withConfirmation =
        template.name === WHATSAPP_CONFIRMATION_REMINDER_TEMPLATE.name;
      if (!withConfirmation) await this.requestNewTemplates(store);

      return { name: template.name, withConfirmation };
    } catch (error) {
      this.logger.error(
        `Lembretes por WhatsApp da loja ${store.id} não verificados`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }

  /**
   * Loja que já usa o lembrete antigo ganha os templates novos (confirmação e
   * lista de espera) sem precisar voltar ao painel. Até a Meta aprovar, o antigo
   * continua saindo; uma falha aqui não segura o lembrete.
   */
  private async requestNewTemplates(store: Store) {
    try {
      await this.whatsappService.ensureStoreTemplates(store.whatsappConfig);
    } catch (error) {
      this.logger.warn(
        `Templates novos da loja ${store.id} não criados: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Instrução única para duas execuções simultâneas não pegarem o mesmo lembrete.
   * Sem linha de retorno, outra execução já enviou ou está enviando. Se o processo
   * morrer durante o envio, a linha fica em `sending`: preferimos perder um
   * lembrete a mandar dois.
   */
  private async claim(
    schedule: Schedule,
    channel: TScheduleReminderChannel,
  ): Promise<Pick<ScheduleReminder, 'id' | 'attempts'> | undefined> {
    const [claim] = await this.reminderRepository.query(
      `INSERT INTO "schedule_reminders"
         ("scheduleId", "channel", "appointmentKey", "status", "attempts")
       VALUES ($1, $2, $3, 'sending', 1)
       ON CONFLICT ("scheduleId", "channel", "appointmentKey") DO UPDATE
         SET "status" = 'sending',
             "attempts" = "schedule_reminders"."attempts" + 1,
             "updated_at" = now()
         WHERE "schedule_reminders"."status" = 'failed'
           AND "schedule_reminders"."attempts" < $4
       RETURNING "id", "attempts"`,
      [
        schedule.id,
        channel,
        `${toDateKey(schedule.date)}T${schedule.startTime}`,
        SCHEDULE_REMINDER_ATTEMPTS,
      ],
    );

    return claim;
  }

  private async send(
    schedule: Schedule,
    recipient: string,
    config: TReminderChannelConfig,
  ): Promise<'sent' | 'failed'> {
    try {
      await config.send(schedule, recipient);

      return 'sent';
    } catch (error) {
      this.logger.error(
        `Falha no lembrete por ${config.channel} do agendamento ${schedule.id}`,
        error instanceof Error ? error.stack : undefined,
      );

      return 'failed';
    }
  }

  private sendEmail(schedule: Schedule, email: string) {
    return this.notificationService.scheduleReminder(email, {
      ...buildCustomerEmailData(schedule),
      price: this.formatPrice(schedule),
      customMessage:
        schedule.store.notificationsSettings?.emailReminderCustomMessage,
      manageLink: `${this.configService.get<string>('FRONTEND_URL')}/profile`,
    });
  }

  private sendWhatsapp(
    schedule: Schedule,
    phone: string,
    template: TStoreReminderTemplate,
  ) {
    const { phoneNumberId, accessToken } = schedule.store.whatsappConfig;

    return this.whatsappService.sendTemplate(
      phoneNumberId,
      phone,
      {
        name: template.name,
        // Os dois templates do lembrete têm o mesmo idioma e os mesmos parâmetros
        language: WHATSAPP_REMINDER_TEMPLATE.language,
        bodyParams: buildReminderTemplateParams({
          ...buildCustomerEmailData(schedule),
          customMessage:
            schedule.store.notificationsSettings?.whatsappReminderCustomMessage,
        }),
        ...(template.withConfirmation && {
          buttonPayloads: buildPresencePayloads(schedule.id),
        }),
      },
      accessToken,
    );
  }

  /** "R$ 50,00, no local"; sem preço fica só "Sob consulta". */
  private formatPrice(schedule: Schedule) {
    const price = getBookingPrice([schedule]);
    return getSchedulePrice(schedule) > 0 ? `${price}, no local` : price;
  }

  private async recordHistory(
    schedule: Schedule,
    recipient: string,
    status: 'sent' | 'failed',
    now: Date,
    config: TReminderChannelConfig,
  ) {
    const history = new NotificationsHistory();
    history.type = 'reminder';
    history.title = 'Lembrete de Agendamento';
    history.message = `${config.historyLabel} de ${this.formatAppointment(schedule)}`;
    history.timestamp = now;
    history.read = false;
    history.recipient = recipient;
    history.store = schedule.store;
    history.status = status;

    try {
      await this.notificationsHistoryService.create(history);
    } catch (error) {
      this.logger.error(
        `Lembrete por ${config.channel} do agendamento ${schedule.id} sem linha no histórico`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private formatAppointment(schedule: Schedule) {
    const [year, month, day] = toDateKey(schedule.date).split('-');

    return `${day}/${month}/${year} às ${schedule.startTime}`;
  }
}
