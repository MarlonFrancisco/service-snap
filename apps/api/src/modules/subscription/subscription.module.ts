import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification';
import { ScheduleModule } from '../partner/stores/schedule';
import { StoreSearchSyncModule } from '../partner/stores/search-sync/store-search-sync.module';
import { StoresModule } from '../partner/stores/stores.module';
import { StripeModule } from '../stripe';
import { UsersModule } from '../users';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './subscription.entity';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [
    NotificationModule,
    StripeModule,
    TypeOrmModule.forFeature([Subscription]),
    UsersModule,
    ScheduleModule,
    StoresModule,
    StoreSearchSyncModule,
    ConfigModule,
  ],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
