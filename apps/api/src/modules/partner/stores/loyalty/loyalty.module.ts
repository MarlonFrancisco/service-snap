import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../category/service/service.entity';
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
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
