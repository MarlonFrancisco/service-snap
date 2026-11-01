import { Module } from '@nestjs/common';
import { MetricsModule } from './metrics/metrics.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { StoresModule } from './stores/stores.module';

@Module({
  imports: [StoresModule, MetricsModule, OnboardingModule],
})
export class PartnerModule {}
