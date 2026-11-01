import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../../subscription/subscription.entity';
import { UsersModule } from '../../users';
import { Category } from '../stores/category/category.entity';
import { Service } from '../stores/category/service/service.entity';
import { Gallery } from '../stores/gallery/gallery.entity';
import { StoreMember } from '../stores/store-member/store-member.entity';
import { StoreMemberModule } from '../stores/store-member/store-member.module';
import { Store } from '../stores/store.entity';
import { StoresModule } from '../stores/stores.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { StoreOnboarding } from './store-onboarding.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StoreOnboarding,
      Store,
      Category,
      Service,
      StoreMember,
      Gallery,
      Subscription,
    ]),
    StoresModule,
    StoreMemberModule,
    UsersModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
