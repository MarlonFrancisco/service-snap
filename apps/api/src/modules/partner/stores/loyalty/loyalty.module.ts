import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../category/service/service.entity';
import { PlanFeatureGuard } from '../guards';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { Store } from '../store.entity';
import { LoyaltyProgram } from './loyalty-program.entity';
import { LoyaltyReward } from './loyalty-reward.entity';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoyaltyProgram, LoyaltyReward, Service, Store]),
    StoreGuardsModule,
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService, PlanFeatureGuard],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
