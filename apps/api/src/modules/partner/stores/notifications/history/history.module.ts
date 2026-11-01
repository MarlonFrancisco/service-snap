import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreGuardsModule } from '../../guards/store-guards.module';
import { NotificationsHistoryController } from './history.controller';
import { NotificationsHistory } from './history.entity';
import { NotificationsHistoryService } from './history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationsHistory]),
    StoreGuardsModule,
  ],
  providers: [NotificationsHistoryService],
  exports: [NotificationsHistoryService],
  controllers: [NotificationsHistoryController],
})
export class NotificationsHistoryModule {}
