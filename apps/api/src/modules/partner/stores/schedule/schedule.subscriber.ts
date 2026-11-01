import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { NotificationService } from '../../../notification/notification.service';
import { NotificationsHistory } from '../notifications/history/history.entity';
import { NotificationsHistoryService } from '../notifications/history/history.service';
import { Schedule } from './schedule.entity';

@EventSubscriber()
export class ScheduleSubscriber implements EntitySubscriberInterface<Schedule> {
  private readonly logger = new Logger(ScheduleSubscriber.name);

  constructor(
    dataSource: DataSource,
    private readonly notificationsHistoryService: NotificationsHistoryService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Schedule;
  }

  async afterInsert(event: InsertEvent<Schedule>) {
    const schedule = await event.manager.findOne(Schedule, {
      where: { id: event.entity.id },
      relations: [
        'store',
        'user',
        'service',
        'storeMember',
        'storeMember.user',
      ],
    });

    if (!schedule || !schedule.store) return;

    const history = new NotificationsHistory();
    history.type = 'booking';
    history.title = 'Novo Agendamento';
    history.message = `Agendamento criado para ${schedule.date} às ${schedule.startTime}`;
    history.timestamp = new Date();
    history.read = false;
    history.store = schedule.store;
    history.status = 'sent';

    if (schedule.user?.email) {
      history.recipient = schedule.user.email;

      const price = schedule.service?.price
        ? new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(Number(schedule.service.price))
        : 'Sob consulta';

      const date = new Date(schedule.date);
      const formattedDate = new Intl.DateTimeFormat('pt-BR').format(date);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      // Roda dentro da transação do agendamento: uma falha no e-mail não pode desfazer a reserva
      try {
        await this.notificationService.scheduleConfirmation(
          schedule.user.email,
          {
            storeName: schedule.store.name || 'Loja',
            customerName: schedule.user.firstName || 'Cliente',
            serviceName: schedule.service?.name || 'Serviço',
            professionalName:
              schedule.storeMember?.user?.firstName || 'Profissional',
            scheduleDate: `${formattedDate} às ${schedule.startTime}`,
            price,
            storeLocation: schedule.store.city || '',
            storeAddress: schedule.store.address || '',
            calendarLink: ``,
            rescheduleLink: `${frontendUrl}/profile`,
            storePhone: schedule.store.telephone || '',
            currentYear: new Date().getFullYear(),
          },
        );
      } catch (error) {
        history.status = 'failed';
        this.logger.error(
          `Agendamento ${schedule.id} salvo sem e-mail de confirmação`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    await this.notificationsHistoryService.create(history);
  }

  async afterUpdate(event: UpdateEvent<Schedule>) {
    const schedule = event.entity as Schedule;

    // Verifica se houve mudança de status
    const statusChanged = event.updatedColumns.find(
      (col) => col.propertyName === 'status',
    );

    if (statusChanged && schedule.status && schedule.store) {
      const history = new NotificationsHistory();
      history.store = schedule.store;
      history.timestamp = new Date();
      history.read = false;
      history.status = 'sent';

      if (schedule.user?.email) {
        history.recipient = schedule.user.email;
      }

      if (schedule.status === 'cancelled') {
        history.type = 'cancellation';
        history.title = 'Agendamento Cancelado';
        history.message = `O agendamento para ${schedule.date} às ${schedule.startTime} foi cancelado.`;
      } else {
        history.type = 'booking';
        history.title = 'Atualização de Agendamento';
        history.message = `Status alterado para: ${schedule.status}`;
      }

      await this.notificationsHistoryService.create(history);
    }
  }
}
