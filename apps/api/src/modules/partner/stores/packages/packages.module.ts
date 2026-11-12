import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../../users/users.module';
import { CashModule } from '../cash/cash.module';
import { Service } from '../category/service/service.entity';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { Store } from '../store.entity';
import {
  CustomerPackage,
  CustomerPackageItem,
} from './customer-package.entity';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { ServicePackage, ServicePackageItem } from './service-package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServicePackage,
      ServicePackageItem,
      CustomerPackage,
      CustomerPackageItem,
      Service,
      Store,
    ]),
    StoreGuardsModule,
    CashModule,
    UsersModule,
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}
