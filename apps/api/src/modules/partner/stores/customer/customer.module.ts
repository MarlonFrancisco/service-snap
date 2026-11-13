import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../../users/users.module';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { Schedule } from '../schedule/schedule.entity';
import { Store } from '../store.entity';
import { CustomerController } from './customer.controller';
import { StoreCustomer } from './customer.entity';
import { CustomerService } from './customer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreCustomer, Schedule, Store]),
    StoreGuardsModule,
    UsersModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
