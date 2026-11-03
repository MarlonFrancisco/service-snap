import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../../../../notification/notification.module';
import { PlanFeatureGuard } from '../../guards';
import { StoreGuardsModule } from '../../guards/store-guards.module';
import { Schedule } from '../../schedule/schedule.entity';
import { WhatsappModule } from '../../whatsapp';
import { NotificationsHistoryModule } from '../history/history.module';
import { CronSecretGuard } from './cron-secret.guard';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { ScheduleReminder } from './schedule-reminder.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, ScheduleReminder]),
    NotificationModule,
    NotificationsHistoryModule,
    StoreGuardsModule,
    WhatsappModule,
  ],
  controllers: [RemindersController],
  providers: [RemindersService, CronSecretGuard, PlanFeatureGuard],
})
export class RemindersModule {}
