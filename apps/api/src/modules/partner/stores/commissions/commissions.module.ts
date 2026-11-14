import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../category/service/service.entity';
import { CheckoutItem } from '../checkout/checkout.entity';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { Schedule } from '../schedule/schedule.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import { CommissionRule } from './commission-rule.entity';
import { CommissionsController } from './commissions.controller';
import { CommissionsService } from './commissions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommissionRule,
      Schedule,
      CheckoutItem,
      Store,
      StoreMember,
      Service,
    ]),
    StoreGuardsModule,
  ],
  controllers: [CommissionsController],
  providers: [CommissionsService],
})
export class CommissionsModule {}
