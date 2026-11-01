import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../../../../notification/notification.module';
import { Schedule } from '../../schedule/schedule.entity';
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
  ],
  controllers: [RemindersController],
  providers: [RemindersService, CronSecretGuard],
})
export class RemindersModule {}
