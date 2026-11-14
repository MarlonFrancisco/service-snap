import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { areNotificationsMuted } from '../../../../utils/helpers/notification-scope.helpers';
import {
  formatScheduleMoment,
  toDateKey,
} from '../../../../utils/helpers/schedule.helpers';
import { NotificationService } from '../../../notification/notification.service';
import { QueueService } from '../../../queue/queue.service';
import type { TQueueJob, TQueueJobMap } from '../../../queue/queue.types';
import { NotificationsHistory } from '../notifications/history/history.entity';
import { NotificationsHistoryService } from '../notifications/history/history.service';
import { WebhookDispatchService } from '../webhooks/webhook-dispatch.service';
import { hasScheduleChanged } from '../webhooks/webhooks.helpers';
import type { TWebhookEvent } from '../webhooks/webhooks.types';
import { ScheduleEventsService } from './schedule-events.service';
import { Schedule } from './schedule.entity';
import {
  buildBookingCalendarLink,
  buildBookingConfirmationData,
  buildCustomerEmailData,
  buildStoreEmailData,
  getBookingPrice,
  getBookingServiceNames,
  getStoreRecipients,
} from './schedule.helpers';

const RELATIONS = [
  'store',
  'store.owner',
  'user',
  'service',
  'storeMember',
  'storeMember.user',
  'booking',
];

/**
 * Avisos de agendamento, chamados depois de salvar. Falha de envio nunca desfaz
 * a operação: a mudança na agenda já está salva. Os métodos públicos só decidem
 * o que avisar e publicam no QStash; o envio roda quando a fila chama de volta,
 * para não atrasar quem agendou.
 */
@Injectable()
export class ScheduleNotificationsService implements OnModuleInit {
  private readonly logger = new Logger(ScheduleNotificationsService.name);

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly notificationsHistoryService: NotificationsHistoryService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly webhookDispatch: WebhookDispatchService,
    private readonly queueService: QueueService,
    private readonly scheduleEvents: ScheduleEventsService,
  ) {}

  onModuleInit() {
    this.queueService.register('schedule.created', (data) =>
      this.sendBookingCreated(data),
    );
    this.queueService.register('schedule.cancelled', (data) =>
      this.sendCancellation(data),
    );
    this.queueService.register('schedule.updated', (data) =>
      this.sendUpdate(data),
    );
  }

  load(id: string) {
    return this.scheduleRepository.findOne({
      where: { id },
      relations: RELATIONS,
    });
  }

  /** Uma reserva com vários serviços vira várias linhas, mas um aviso só. */
  async notifyBookingCreated(ids: string[], createdByStore: boolean) {
    await this.enqueue({
      type: 'schedule.created',
      data: {
        scheduleIds: ids,
        createdByStore,
        // Lote (ex.: série recorrente) manda um aviso só: o resto vai calado
        notify: !areNotificationsMuted(),
      },
    });
  }

  async notifyCancellation(schedule: Schedule, cancelledByCustomer: boolean) {
    await this.enqueue({
      type: 'schedule.cancelled',
      data: {
        scheduleId: schedule.id,
        cancelledByCustomer,
        notify: !areNotificationsMuted(),
      },
    });
  }

  /** Só a requisição conhece o "antes": a decisão sai daqui pronta. */
  async notifyUpdate(before: Schedule, after: Schedule) {
    if (before.status !== 'cancelled' && after.status === 'cancelled') {
      await this.notifyCancellation(after, false);
      return;
    }

    const timeChanged =
      toDateKey(before.date) !== toDateKey(after.date) ||
      before.startTime !== after.startTime;
    const professionalChanged =
      before.storeMember?.id !== after.storeMember?.id;
    const webhook = hasScheduleChanged(before, after);
    const notifyChange =
      after.status === 'scheduled' && (timeChanged || professionalChanged);

    if (!webhook && !notifyChange) return;

    await this.enqueue({
      type: 'schedule.updated',
      data: {
        scheduleId: after.id,
        webhook,
        notifyChange,
        previousSchedule: timeChanged
          ? formatScheduleMoment(before)
          : undefined,
        // O horário de antes ficou livre: a fila avisa a lista de espera
        freedDate:
          notifyChange && before.date ? toDateKey(before.date) : undefined,
      },
    });
  }

  private async sendBookingCreated({
    scheduleIds,
    createdByStore,
    notify,
  }: TQueueJobMap['schedule.created']) {
    const schedules = await this.scheduleRepository.find({
      where: { id: In(scheduleIds) },
      relations: RELATIONS,
      order: { startTime: 'ASC' },
    });

    if (!schedules[0]?.store) return;

    await this.emitWebhook(
      'schedule.created',
      schedules[0].store.id,
      scheduleIds,
    );

    if (!notify) return;

    await this.confirmBooking(schedules);
    await this.attempt(
      `Novo agendamento ${scheduleIds.join(', ')} para a loja`,
      () => this.notifyStoreOfBooking(schedules, createdByStore),
    );
  }

  private async confirmBooking(schedules: Schedule[]) {
    const [first] = schedules;

    await this.notifyCustomer(
      first,
      {
        type: 'booking',
        title: 'Novo Agendamento',
        message: `Agendamento criado para ${formatScheduleMoment(first)}`,
      },
      (email) =>
        this.notificationService.scheduleConfirmation(
          email,
          buildBookingConfirmationData(schedules, this.frontendUrl),
        ),
    );
  }

  private async notifyStoreOfBooking(
    schedules: Schedule[],
    createdByStore: boolean,
  ) {
    const [first] = schedules;
    const recipients = getStoreRecipients(first);

    if (!recipients.length) return;

    await this.notificationService.scheduleNewBooking(recipients, {
      ...buildStoreEmailData(first, this.frontendUrl),
      serviceName: getBookingServiceNames(schedules),
      price: getBookingPrice(schedules),
      createdByStore,
    });
  }

  private async sendCancellation({
    scheduleId,
    cancelledByCustomer,
    notify,
  }: TQueueJobMap['schedule.cancelled']) {
    const schedule = await this.load(scheduleId);

    if (!schedule?.store) return;

    await this.emitWebhook('schedule.cancelled', schedule.store.id, [
      schedule.id,
    ]);

    // A lista de espera é avisada mesmo num lote calado: o silêncio é do cliente
    await this.slotFreed(schedule.store.id, schedule.date);

    if (!notify) return;

    await this.notifyCustomer(
      schedule,
      {
        type: 'cancellation',
        title: 'Agendamento Cancelado',
        message: `O agendamento de ${formatScheduleMoment(schedule)} foi cancelado.`,
      },
      (email) =>
        this.notificationService.scheduleCancelled(email, {
          ...buildCustomerEmailData(schedule),
          cancelledByCustomer,
          bookingLink: `${this.frontendUrl}/booking/${schedule.store.id}`,
        }),
    );

    if (!cancelledByCustomer) return;

    const recipients = getStoreRecipients(schedule);

    if (!recipients.length) return;

    await this.attempt(`Cancelamento ${schedule.id} para a loja`, () =>
      this.notificationService.scheduleCustomerCancelled(
        recipients,
        buildStoreEmailData(schedule, this.frontendUrl),
      ),
    );
  }

  private async sendUpdate({
    scheduleId,
    webhook,
    notifyChange,
    previousSchedule,
    freedDate,
  }: TQueueJobMap['schedule.updated']) {
    const after = await this.load(scheduleId);

    if (!after?.store) return;

    if (webhook) {
      await this.emitWebhook('schedule.updated', after.store.id, [after.id]);
    }

    // O horário de antes ficou livre mesmo que o agendamento mude de novo
    await this.slotFreed(after.store.id, freedDate);

    // Mudou de novo até a fila chamar: o aviso de agora já não vale
    if (!notifyChange || after.status !== 'scheduled') return;

    await this.notifyCustomer(
      after,
      {
        type: 'booking',
        title: 'Agendamento Alterado',
        message: `Agendamento alterado para ${formatScheduleMoment(after)}.`,
      },
      (email) =>
        this.notificationService.scheduleChanged(email, {
          ...buildCustomerEmailData(after),
          previousSchedule,
          calendarLink: buildBookingCalendarLink([after]),
          manageLink: `${this.frontendUrl}/profile`,
        }),
    );
  }

  /** Avisa a lista de espera que um horário desse dia vagou. */
  private async slotFreed(storeId: string, date?: Date | string) {
    if (!date) return;

    await this.scheduleEvents.emitSlotFreed({ storeId, date: toDateKey(date) });
  }

  private async notifyCustomer(
    schedule: Schedule,
    entry: Pick<NotificationsHistory, 'type' | 'title' | 'message'>,
    send: (email: string) => Promise<unknown>,
  ) {
    const email = schedule.user?.email;

    // Cliente só com telefone, como os do WhatsApp: não houve aviso para registrar
    if (!email) return;

    const sent = await this.attempt(`Aviso ao cliente ${schedule.id}`, () =>
      send(email),
    );

    await this.recordHistory(schedule, {
      ...entry,
      recipient: email,
      status: sent ? 'sent' : 'failed',
    });
  }

  private async recordHistory(
    schedule: Schedule,
    entry: Pick<
      NotificationsHistory,
      'type' | 'title' | 'message' | 'recipient' | 'status'
    >,
  ) {
    const history = new NotificationsHistory();
    Object.assign(history, entry);
    history.store = schedule.store;
    history.timestamp = new Date();
    history.read = false;

    await this.attempt(`Histórico do agendamento ${schedule.id}`, () =>
      this.notificationsHistoryService.create(history),
    );
  }

  /** Fila fora do ar não desfaz a agenda: o aviso se perde e fica no log. */
  private enqueue(job: TQueueJob) {
    return this.attempt(`Fila ${job.type}`, () =>
      this.queueService.enqueue(job),
    );
  }

  /** Webhook com erro não impede o e-mail: cada efeito tem a sua tentativa. */
  private emitWebhook(
    event: TWebhookEvent,
    storeId: string | undefined,
    ids: string[],
  ) {
    return this.attempt(`Webhook ${event} ${ids.join(', ')}`, () =>
      this.webhookDispatch.emitScheduleEvent(event, storeId, ids),
    );
  }

  private async attempt(description: string, run: () => Promise<unknown>) {
    try {
      await run();
      return true;
    } catch (error) {
      this.logger.error(
        `${description} falhou`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  private get frontendUrl() {
    return this.configService.get<string>('FRONTEND_URL');
  }
}
