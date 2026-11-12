import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnamnesisResponse } from '../partner/stores/anamnesis/anamnesis-response.entity';
import { StorePayment } from '../partner/stores/cash/store-payment.entity';
import { LoyaltyReward } from '../partner/stores/loyalty/loyalty-reward.entity';
import { CustomerPackage } from '../partner/stores/packages/customer-package.entity';
import { Review } from '../partner/stores/review/review.entity';
import { Schedule } from '../partner/stores/schedule/schedule.entity';
import { StoreSearchSyncModule } from '../partner/stores/search-sync/store-search-sync.module';
import { StoreMember } from '../partner/stores/store-member/store-member.entity';
import { Store } from '../partner/stores/store.entity';
import { StorageModule } from '../storage/storage.module';
import { StripeModule } from '../stripe';
import { Subscription } from '../subscription/subscription.entity';
import { Favorite } from '../users/favorites/favorite.entity';
import { User } from '../users/user.entity';
import { PrivacyController } from './privacy.controller';
import { PrivacyService } from './privacy.service';

/** Fica fora do `UsersModule`: a busca depende de usuários e criaria um ciclo. */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Schedule,
      Review,
      Favorite,
      AnamnesisResponse,
      CustomerPackage,
      LoyaltyReward,
      StorePayment,
      StoreMember,
      Store,
      Subscription,
    ]),
    StripeModule,
    StorageModule,
    StoreSearchSyncModule,
  ],
  controllers: [PrivacyController],
  providers: [PrivacyService],
})
export class PrivacyModule {}
