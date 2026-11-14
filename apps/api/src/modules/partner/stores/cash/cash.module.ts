import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { Store } from '../store.entity';
import { CashSession } from './cash-session.entity';
import { CashController } from './cash.controller';
import { CashService } from './cash.service';
import { PaymentsService } from './payments.service';
import { StorePayment } from './store-payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashSession, StorePayment, Store]),
    StoreGuardsModule,
  ],
  controllers: [CashController],
  providers: [CashService, PaymentsService],
  exports: [PaymentsService],
})
export class CashModule {}
