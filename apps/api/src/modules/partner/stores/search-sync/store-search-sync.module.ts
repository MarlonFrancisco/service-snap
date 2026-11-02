import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchModule } from '../../../search/search.module';
import { Store } from '../store.entity';
import { StoreSearchSyncService } from './store-search-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store]), SearchModule],
  providers: [StoreSearchSyncService],
  exports: [StoreSearchSyncService],
})
export class StoreSearchSyncModule {}
