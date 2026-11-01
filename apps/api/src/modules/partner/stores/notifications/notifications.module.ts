import { Module } from '@nestjs/common';
import { NotificationsHistoryModule } from './history/history.module';
import { RemindersModule } from './reminders/reminders.module';
import { NotificationsSettingsModule } from './settings/settings.module';

@Module({
  imports: [
    NotificationsSettingsModule,
    NotificationsHistoryModule,
    RemindersModule,
  ],
})
export class NotificationsModule {}
