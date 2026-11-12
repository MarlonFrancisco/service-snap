import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { IsNull, Repository } from 'typeorm';
import { getStoreTimezone } from '../../../../utils/helpers/region.helpers';
import {
  formatScheduleMoment,
  getStoreNow,
  timeToMinutes,
  toDateKey,
} from '../../../../utils/helpers/schedule.helpers';
import {
  getUserFullName,
  normalizePhoneNumber,
} from '../../../../utils/helpers/user.helpers';
import { NotificationsHistory } from '../notifications/history/history.entity';
import { NotificationsHistoryService } from '../notifications/history/history.service';
import { ScheduleReminder } from '../notifications/reminders/schedule-reminder.entity';
import type { TPresenceAwaiting } from './schedule-presence.types';
import { Schedule } from './schedule.entity';

const RELATIONS = [
  'store',
  'user',
  'service',
  'storeMember',
  'storeMember.user',
];

/**
 * Confirmação de presença pelo lembrete do WhatsApp. O "não" não passa por aqui:
 * é o cancelamento de sempre, com os mesmos avisos.
 */
@Injectable()
export class SchedulePresenceService {
  private readonly logger = new Logger(SchedulePresenceService.name);

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly notificationsHistoryService: NotificationsHistoryService,
  ) {}

  /**
   * Agendamento da loja que é de quem escreveu. O id vem de um botão, e o
   * telefone garante que ninguém responde pelo horário de outra pessoa.
   */
  async findForCustomer(
    storeId: string,
    scheduleId: string,
    telephone: string,
  ): Promise<Schedule | null> {
    const phone = normalizePhoneNumber(telephone);
    if (!phone || !isUUID(scheduleId)) return null;

    return this.scheduleRepository.findOne({
      where: {
        id: scheduleId,
        store: { id: storeId },
        user: { telephone: phone },
      },
      relations: RELATIONS,
    });
  }

  /**
   * Para quem digita "sim" ou "não" em vez de tocar no botão: o próximo
   * atendimento que recebeu o lembrete pelo WhatsApp e ainda não foi confirmado.
   */
  async findAwaitingAnswer(
    storeId: string,
    telephone: string,
    now = new Date(),
  ): Promise<Schedule | null> {
    const phone = normalizePhoneNumber(telephone);
    if (!phone) return null;

    const candidates = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.store', 'store')
      .innerJoinAndSelect('schedule.user', 'user')
      .leftJoinAndSelect('schedule.service', 'service')
      .leftJoinAndSelect('schedule.storeMember', 'storeMember')
      .leftJoinAndSelect('storeMember.user', 'memberUser')
      // O lembrete do horário atual: o de antes de uma remarcação não conta
      .innerJoin(
        ScheduleReminder,
        'reminder',
        `"reminder"."scheduleId" = "schedule"."id"
          AND "reminder"."channel" = 'whatsapp'
          AND "reminder"."status" = 'sent'
          AND "reminder"."appointmentKey" =
            to_char("schedule"."date", 'YYYY-MM-DD') || 'T' || "schedule"."startTime"`,
      )
      .where('store.id = :storeId', { storeId })
      .andWhere('user.telephone = :phone', { phone })
      .andWhere("schedule.status = 'scheduled'")
      .andWhere('schedule.presenceConfirmedAt IS NULL')
      .andWhere('schedule.date >= CURRENT_DATE - 1')
      .orderBy('schedule.date', 'ASC')
      .addOrderBy('schedule.startTime', 'ASC')
      .take(5)
      .getMany();

    return (
      candidates.find((schedule) => this.isUpcoming(schedule, now)) ?? null
    );
  }

  /**
   * Agendamentos da loja cujo lembrete perguntou se o cliente vem e que ainda
   * não tiveram resposta, para a agenda mostrar "aguardando resposta".
   */
  async findAwaitingForStore(storeId: string): Promise<TPresenceAwaiting[]> {
    const rows: { scheduleId: string; reminderSentAt: Date }[] =
      await this.scheduleRepository.query(
        `SELECT "schedule"."id" AS "scheduleId", "reminder"."updated_at" AS "reminderSentAt"
         FROM "schedules" "schedule"
         JOIN "schedule_reminders" "reminder"
           ON "reminder"."scheduleId" = "schedule"."id"
          AND "reminder"."channel" = 'whatsapp'
          AND "reminder"."status" = 'sent'
          AND "reminder"."asksPresence" = true
          AND "reminder"."appointmentKey" =
            to_char("schedule"."date", 'YYYY-MM-DD') || 'T' || "schedule"."startTime"
         WHERE "schedule"."storeId" = $1
           AND "schedule"."status" = 'scheduled'
           AND "schedule"."presenceConfirmedAt" IS NULL
           AND "schedule"."date" >= CURRENT_DATE - 1`,
        [storeId],
      );

    return rows;
  }

  /** Ainda não começou, no fuso da loja. */
  isUpcoming(schedule: Schedule, now = new Date()) {
    const today = getStoreNow(getStoreTimezone(schedule.store), now);
    const date = toDateKey(schedule.date);

    return (
      date > today.date ||
      (date === today.date && timeToMinutes(schedule.startTime) > today.minutes)
    );
  }

  /**
   * Grava a confirmação uma vez só: tocar de novo no botão não muda a hora
   * nem repete o aviso no histórico da loja.
   */
  async confirm(schedule: Schedule, now = new Date()): Promise<void> {
    const result = await this.scheduleRepository.update(
      {
        id: schedule.id,
        status: 'scheduled',
        presenceConfirmedAt: IsNull(),
      },
      { presenceConfirmedAt: now },
    );

    if (!result.affected) return;

    const history = new NotificationsHistory();
    history.type = 'booking';
    history.title = 'Presença confirmada';
    history.message = `${getUserFullName(schedule.user) || 'O cliente'} confirmou presença em ${formatScheduleMoment(schedule)}.`;
    history.timestamp = now;
    history.read = false;
    history.store = schedule.store;

    try {
      await this.notificationsHistoryService.create(history);
    } catch (error) {
      // A confirmação já está na agenda; o histórico é só o aviso
      this.logger.error(
        `Confirmação do agendamento ${schedule.id} sem linha no histórico`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
