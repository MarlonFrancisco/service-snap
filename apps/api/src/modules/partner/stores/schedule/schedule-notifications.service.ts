import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InBackground } from '../../../../utils/helpers/background.helpers';
import { areNotificationsMuted } from '../../../../utils/helpers/notification-scope.helpers';
import {
  formatScheduleMoment,
  toDateKey,
} from '../../../../utils/helpers/schedule.helpers';
import { NotificationService } from '../../../notification/notification.service';
import { NotificationsHistory } from '../notifications/history/history.entity';
import { NotificationsHistoryService } from '../notifications/history/history.service';
import { WebhookDispatchService } from '../webhooks/webhook-dispatch.service';
import { hasScheduleChanged } from '../webhooks/webhooks.helpers';
import type { TWebhookEvent } from '../webhooks/webhooks.types';
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
];

/**
 * Avisos de agendamento, chamados depois de salvar. Falha de envio nunca desfaz
 * a operação: a mudança na agenda já está salva. Os públicos rodam depois da
 * resposta (`@InBackground`), para o envio não atrasar quem agendou.
 */
@Injectable()
export class ScheduleNotificationsService {
  private readonly logger = new Logger(ScheduleNotificationsService.name);

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly notificationsHistoryService: NotificationsHistoryService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly webhookDispatch: WebhookDispatchService,
  ) {}

  load(id: string) {
    return this.scheduleRepository.findOne({
      where: { id },
      relations: RELATIONS,
    });
  }

  /** Uma reserva com vários serviços vira várias linhas, mas um aviso só. */
  @InBackground()
  async notifyBookingCreated(ids: string[], createdByStore: boolean) {
    await this.attempt(`Novo agendamento ${ids.join(', ')}`, async () => {
      const schedules = await this.scheduleRepository.find({
        where: { id: In(ids) },
        relations: RELATIONS,
        order: { startTime: 'ASC' },
      });

      if (!schedules[0]?.store) return;

      await this.emitWebhook('schedule.created', schedules[0].store.id, ids);

      // Lote (ex.: série recorrente) manda um aviso só, no fim
      if (areNotificationsMuted()) return;

      await this.confirmBooking(schedules);
      await this.notifyStoreOfBooking(schedules, createdByStore);
    });
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

  @InBackground()
  async notifyCancellation(schedule: Schedule, cancelledByCustomer: boolean) {
    await this.emitWebhook('schedule.cancelled', schedule.store?.id, [
      schedule.id,
    ]);

    if (areNotificationsMuted()) return;

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

  @InBackground()
  async notifyUpdate(before: Schedule, after: Schedule) {
    if (before.status !== 'cancelled' && after.status === 'cancelled') {
      await this.notifyCancellation(after, false);
      return;
    }

    if (hasScheduleChanged(before, after)) {
      await this.emitWebhook('schedule.updated', after.store?.id, [after.id]);
    }

    if (after.status !== 'scheduled') return;

    const timeChanged =
      toDateKey(before.date) !== toDateKey(after.date) ||
      before.startTime !== after.startTime;
    const professionalChanged =
      before.storeMember?.id !== after.storeMember?.id;

    if (!timeChanged && !professionalChanged) return;

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
          previousSchedule: timeChanged
            ? formatScheduleMoment(before)
            : undefined,
          calendarLink: buildBookingCalendarLink([after]),
          manageLink: `${this.frontendUrl}/profile`,
        }),
    );
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
