import { Module } from '@nestjs/common';
import { MetricsModule } from './metrics/metrics.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { StoreManagementModule } from './stores/store-management.module';
import { StoresModule } from './stores/stores.module';

@Module({
  imports: [
    StoresModule,
    MetricsModule,
    OnboardingModule,
    StoreManagementModule,
  ],
})
export class PartnerModule {}
