import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreGuardsModule } from '../../guards/store-guards.module';
import { StoreSearchSyncModule } from '../../search-sync/store-search-sync.module';
import { Category } from '../category.entity';
import { ServiceController } from './service.controller';
import { Service } from './service.entity';
import { ServiceService } from './service.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, Category]),
    StoreGuardsModule,
    StoreSearchSyncModule,
  ],
  providers: [ServiceService],
  controllers: [ServiceController],
  exports: [ServiceService],
})
export class ServiceModule {}
