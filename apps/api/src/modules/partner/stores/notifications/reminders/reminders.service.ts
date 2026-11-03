import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { setTimeout as sleep } from 'timers/promises';
import { Repository } from 'typeorm';
import {
  storeTimeToDate,
  toDateKey,
} from '../../../../../utils/helpers/schedule.helpers';
import { NotificationService } from '../../../../notification/notification.service';
import {
  buildCustomerEmailData,
  getBookingPrice,
} from '../../schedule/schedule.helpers';
import { Schedule } from '../../schedule/schedule.entity';
import { NotificationsHistory } from '../history/history.entity';
import { NotificationsHistoryService } from '../history/history.service';
import {
  SCHEDULE_REMINDER_ATTEMPTS,
  ScheduleReminder,
} from './schedule-reminder.entity';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const DEFAULT_ADVANCE_HOURS = 24;
// Acima do maior valor do painel (48h): antecedência maior só encurta o aviso
const SEARCH_HORIZON_HOURS = 72;
// Limite do Resend e duração da função: o que sobrar sai na execução seguinte
const MAX_SENDS_PER_RUN = 50;
const SEND_INTERVAL_MS = 600;

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
  ) {}

  async sendDueEmailReminders(now = new Date()) {
    const schedules = await this.findCandidates(now);
    const result = { sent: 0, failed: 0 };
    let attemptedSends = 0;

    for (const schedule of schedules) {
      if (attemptedSends === MAX_SENDS_PER_RUN) break;
      if (!this.isDue(schedule, now)) continue;

      const claim = await this.claim(schedule);
      if (!claim) continue;

      if (attemptedSends > 0) await sleep(SEND_INTERVAL_MS);
      attemptedSends += 1;

      const status = await this.send(schedule);
      result[status] += 1;

      // Marca antes do histórico: uma falha ao gravá-lo não pode reenviar o e-mail
      await this.reminderRepository.update({ id: claim.id }, { status });

      if (status === 'sent' || claim.attempts >= SCHEDULE_REMINDER_ATTEMPTS) {
        await this.recordHistory(schedule, status, now);
      }
    }

    return result;
  }

  /** O filtro exato depende do fuso da loja, então a consulta só limita por dia. */
  private findCandidates(now: Date) {
    const from = new Date(now.getTime() - DAY_MS);
    const to = new Date(
      now.getTime() + SEARCH_HORIZON_HOURS * HOUR_MS + DAY_MS,
    );

    return this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.user', 'user')
      .innerJoinAndSelect('schedule.store', 'store')
      .innerJoinAndSelect('store.notificationsSettings', 'settings')
      .leftJoinAndSelect('schedule.service', 'service')
      .leftJoinAndSelect('schedule.storeMember', 'storeMember')
      .leftJoinAndSelect('storeMember.user', 'memberUser')
      .where('settings.emailReminderEnabled = true')
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

  private isDue(schedule: Schedule, now: Date) {
    if (!schedule.user.email || !schedule.date || !schedule.startTime) {
      return false;
    }

    try {
      const startsAt = storeTimeToDate(
        toDateKey(schedule.date),
        schedule.startTime,
        schedule.store.timezone || 'America/Sao_Paulo',
      ).getTime();
      const advanceHours = parseAdvanceHours(
        schedule.store.notificationsSettings.emailReminderAdvanceHours,
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
   * Instrução única para duas execuções simultâneas não pegarem o mesmo lembrete.
   * Sem linha de retorno, outra execução já enviou ou está enviando. Se o processo
   * morrer durante o envio, a linha fica em `sending`: preferimos perder um
   * lembrete a mandar dois.
   */
  private async claim(
    schedule: Schedule,
  ): Promise<Pick<ScheduleReminder, 'id' | 'attempts'> | undefined> {
    const [claim] = await this.reminderRepository.query(
      `INSERT INTO "schedule_reminders"
         ("scheduleId", "channel", "appointmentKey", "status", "attempts")
       VALUES ($1, 'email', $2, 'sending', 1)
       ON CONFLICT ("scheduleId", "channel", "appointmentKey") DO UPDATE
         SET "status" = 'sending',
             "attempts" = "schedule_reminders"."attempts" + 1,
             "updated_at" = now()
         WHERE "schedule_reminders"."status" = 'failed'
           AND "schedule_reminders"."attempts" < $3
       RETURNING "id", "attempts"`,
      [
        schedule.id,
        `${toDateKey(schedule.date)}T${schedule.startTime}`,
        SCHEDULE_REMINDER_ATTEMPTS,
      ],
    );

    return claim;
  }

  private async send(schedule: Schedule): Promise<'sent' | 'failed'> {
    try {
      await this.notificationService.scheduleReminder(schedule.user.email, {
        ...buildCustomerEmailData(schedule),
        price: this.formatPrice(schedule),
        customMessage:
          schedule.store.notificationsSettings?.emailReminderCustomMessage,
        manageLink: `${this.configService.get<string>('FRONTEND_URL')}/profile`,
      });

      return 'sent';
    } catch (error) {
      this.logger.error(
        `Falha no lembrete do agendamento ${schedule.id}`,
        error instanceof Error ? error.stack : undefined,
      );

      return 'failed';
    }
  }

  /** "R$ 50,00, no local"; sem preço fica só "Sob consulta". */
  private formatPrice(schedule: Schedule) {
    const price = getBookingPrice([schedule]);
    return Number(schedule.service?.price) > 0 ? `${price}, no local` : price;
  }

  private async recordHistory(
    schedule: Schedule,
    status: 'sent' | 'failed',
    now: Date,
  ) {
    const history = new NotificationsHistory();
    history.type = 'reminder';
    history.title = 'Lembrete de Agendamento';
    history.message = `Lembrete do agendamento de ${this.formatAppointment(schedule)}`;
    history.timestamp = now;
    history.read = false;
    history.recipient = schedule.user.email;
    history.store = schedule.store;
    history.status = status;

    try {
      await this.notificationsHistoryService.create(history);
    } catch (error) {
      this.logger.error(
        `Lembrete do agendamento ${schedule.id} sem linha no histórico`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private formatAppointment(schedule: Schedule) {
    const [year, month, day] = toDateKey(schedule.date).split('-');

    return `${day}/${month}/${year} às ${schedule.startTime}`;
  }
}
