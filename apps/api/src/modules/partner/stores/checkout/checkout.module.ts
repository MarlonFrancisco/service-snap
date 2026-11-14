import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashModule } from '../cash/cash.module';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { CustomerPackage } from '../packages/customer-package.entity';
import { ScheduleModule } from '../schedule/schedule.module';
import { Schedule } from '../schedule/schedule.entity';
import { Store } from '../store.entity';
import { CheckoutController } from './checkout.controller';
import { Checkout, CheckoutItem } from './checkout.entity';
import { CheckoutService } from './checkout.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Checkout,
      CheckoutItem,
      Schedule,
      CustomerPackage,
      Store,
    ]),
    StoreGuardsModule,
    ScheduleModule,
    CashModule,
    LoyaltyModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
