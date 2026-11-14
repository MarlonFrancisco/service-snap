import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from '../partner/stores/schedule/schedule.entity';
import { StoreSearchSyncModule } from '../partner/stores/search-sync/store-search-sync.module';
import { Store } from '../partner/stores/store.entity';
import { Subscription } from '../subscription/subscription.entity';
import { User } from '../users/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PlatformAdminGuard } from './platform-admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Store, Schedule, Subscription]),
    StoreSearchSyncModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, PlatformAdminGuard],
})
export class AdminModule {}
