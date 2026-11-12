import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../../../notification/notification.module';
import { UsersModule } from '../../../users/users.module';
import { PlanFeatureGuard } from '../guards';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { ScheduleModule } from '../schedule';
import { Service } from '../category/service/service.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import { WhatsappModule } from '../whatsapp';
import { WaitlistEntry } from './waitlist-entry.entity';
import { MyWaitlistController } from './my-waitlist.controller';
import { WaitlistController } from './waitlist.controller';
import { WaitlistNotificationsService } from './waitlist-notifications.service';
import { WaitlistService } from './waitlist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WaitlistEntry, Store, StoreMember, Service]),
    ScheduleModule,
    WhatsappModule,
    NotificationModule,
    StoreGuardsModule,
    UsersModule,
  ],
  controllers: [WaitlistController, MyWaitlistController],
  providers: [WaitlistService, WaitlistNotificationsService, PlanFeatureGuard],
  exports: [WaitlistService],
})
export class WaitlistModule {}
