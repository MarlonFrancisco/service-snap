import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth';
import { Subscription } from '../../subscription/subscription.entity';
import { CalendarFeedModule } from './calendar-feed/calendar-feed.module';
import { CategoryModule } from './category';
import { CustomerModule } from './customer/customer.module';
import { GalleryModule } from './gallery';
import { HolidayModule } from './holiday';
import { StoreAccessGuard, StoreOwnerGuard, StoreRoleGuard } from './guards';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewModule } from './review';
import { StoreSearchSyncModule } from './search-sync/store-search-sync.module';
import { ScheduleModule } from './schedule';
import { BlockedTimeModule } from './store-member/blocked-time/blocked-time.module';
import { StoreMemberModule } from './store-member/store-member.module';
import { TeamModule } from './team/team.module';
import { Store } from './store.entity';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.services';
import { WaitlistModule } from './waitlist';
import { WhatsappModule } from './whatsapp';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, Subscription]),
    AuthModule,
    StoreMemberModule,
    BlockedTimeModule,
    GalleryModule,
    HolidayModule,
    CategoryModule,
    CustomerModule,
    ScheduleModule,
    NotificationsModule,
    ReviewModule,
    CalendarFeedModule,
    StoreSearchSyncModule,
    TeamModule,
    WaitlistModule,
    WhatsappModule,
  ],
  controllers: [StoresController],
  providers: [StoresService, StoreAccessGuard, StoreOwnerGuard, StoreRoleGuard],
  exports: [StoresService],
})
export class StoresModule {}
