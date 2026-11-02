import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { StoreSearchSyncModule } from '../search-sync/store-search-sync.module';
import { CategoryController } from './category.controller';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { ServiceModule } from './service/service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    StoreGuardsModule,
    ServiceModule,
    StoreSearchSyncModule,
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService, ServiceModule],
})
export class CategoryModule {}
