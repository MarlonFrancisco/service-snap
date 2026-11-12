import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../../../notification/notification.module';
import { UsersModule } from '../../../users/users.module';
import { PlanFeatureGuard } from '../guards';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { ScheduleModule } from '../schedule';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import { WhatsappModule } from '../whatsapp';
import { WaitlistEntry } from './waitlist-entry.entity';
import { WaitlistController } from './waitlist.controller';
import { WaitlistNotificationsService } from './waitlist-notifications.service';
import { WaitlistService } from './waitlist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WaitlistEntry, Store, StoreMember]),
    ScheduleModule,
    WhatsappModule,
    NotificationModule,
    StoreGuardsModule,
    UsersModule,
  ],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistNotificationsService, PlanFeatureGuard],
  exports: [WaitlistService],
})
export class WaitlistModule {}
