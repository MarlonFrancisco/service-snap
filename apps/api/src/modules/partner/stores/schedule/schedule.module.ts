import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../../../notification/notification.module';
import { UsersModule } from '../../../users/users.module';
import { Service } from '../category/service/service.entity';
import { NotificationsHistoryModule } from '../notifications/history/history.module';
import { BlockedTime } from '../store-member/blocked-time/blocked-time.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import { ScheduleController } from './schedule.controller';
import { Schedule } from './schedule.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleSubscriber } from './schedule.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Schedule,
      Store,
      Service,
      StoreMember,
      BlockedTime,
    ]),
    UsersModule,
    NotificationsHistoryModule,
    NotificationModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleSubscriber],
  exports: [ScheduleService],
})
export class ScheduleModule {}
