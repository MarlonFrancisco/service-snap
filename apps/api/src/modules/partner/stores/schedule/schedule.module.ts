import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../../../notification/notification.module';
import { UsersModule } from '../../../users/users.module';
import { Service } from '../category/service/service.entity';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { NotificationsHistoryModule } from '../notifications/history/history.module';
import { HolidayModule } from '../holiday/holiday.module';
import { BlockedTime } from '../store-member/blocked-time/blocked-time.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import { WebhookDispatchModule } from '../webhooks/webhook-dispatch.module';
import { ScheduleNotificationsService } from './schedule-notifications.service';
import { ScheduleController } from './schedule.controller';
import { Booking } from './booking.entity';
import { Schedule } from './schedule.entity';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Schedule,
      Booking,
      Store,
      Service,
      StoreMember,
      BlockedTime,
    ]),
    StoreGuardsModule,
    UsersModule,
    NotificationsHistoryModule,
    NotificationModule,
    WebhookDispatchModule,
    HolidayModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleNotificationsService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
