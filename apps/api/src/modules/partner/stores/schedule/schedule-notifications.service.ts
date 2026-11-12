import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  formatScheduleMoment,
  toDateKey,
} from '../../../../utils/helpers/schedule.helpers';
import { NotificationService } from '../../../notification/notification.service';
import { PushService } from '../../../push/push.service';
import { NotificationsHistory } from '../notifications/history/history.entity';
import { NotificationsHistoryService } from '../notifications/history/history.service';
import { Schedule } from './schedule.entity';
import {
  buildBookingCalendarLink,
  buildBookingConfirmationData,
  buildCustomerEmailData,
  buildStoreEmailData,
  buildStorePushBody,
  getBookingPrice,
  getBookingServiceNames,
  getStoreRecipientUserIds,
  getStoreRecipients,
} from './schedule.helpers';

const AGENDA_PATH = '/partner/agenda';

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
 * a operação: a mudança na agenda já está salva.
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
    private readonly pushService: PushService,
  ) {}

  load(id: string) {
    return this.scheduleRepository.findOne({
      where: { id },
      relations: RELATIONS,
    });
  }

  /** Uma reserva com vários serviços vira várias linhas, mas um aviso só. */
  async notifyBookingCreated(ids: string[], createdByStore: boolean) {
    await this.attempt(`Novo agendamento ${ids.join(', ')}`, async () => {
      const schedules = await this.scheduleRepository.find({
        where: { id: In(ids) },
        relations: RELATIONS,
        order: { startTime: 'ASC' },
      });

      if (!schedules[0]?.store) return;

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

    // Quem marcou pela loja já sabe do agendamento: push só para reserva do cliente
    if (!createdByStore) {
      await this.pushService.sendToUsers(getStoreRecipientUserIds(first), {
        title: 'Novo agendamento',
        body: buildStorePushBody(first, getBookingServiceNames(schedules)),
        url: AGENDA_PATH,
        tag: `booking-${first.id}`,
      });
    }

    const recipients = getStoreRecipients(first);

    if (!recipients.length) return;

    await this.notificationService.scheduleNewBooking(recipients, {
      ...buildStoreEmailData(first, this.frontendUrl),
      serviceName: getBookingServiceNames(schedules),
      price: getBookingPrice(schedules),
      createdByStore,
    });
  }

  async notifyCancellation(schedule: Schedule, cancelledByCustomer: boolean) {
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

    await this.pushService.sendToUsers(getStoreRecipientUserIds(schedule), {
      title: 'Cliente cancelou',
      body: buildStorePushBody(schedule),
      url: AGENDA_PATH,
      tag: `booking-${schedule.id}`,
    });

    const recipients = getStoreRecipients(schedule);

    if (!recipients.length) return;

    await this.attempt(`Cancelamento ${schedule.id} para a loja`, () =>
      this.notificationService.scheduleCustomerCancelled(
        recipients,
        buildStoreEmailData(schedule, this.frontendUrl),
      ),
    );
  }

  async notifyUpdate(before: Schedule, after: Schedule) {
    if (before.status !== 'cancelled' && after.status === 'cancelled') {
      await this.notifyCancellation(after, false);
      return;
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
