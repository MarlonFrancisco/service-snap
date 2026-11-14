import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { NotificationsHistoryModule } from '../notifications/history/history.module';
import { Schedule } from '../schedule/schedule.entity';
import { StoreSearchSyncModule } from '../search-sync/store-search-sync.module';
import { ReviewController } from './review.controller';
import { Review } from './review.entity';
import { ReviewService } from './review.service';
import { ReviewSubscriber } from './review.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Schedule]),
    NotificationsHistoryModule,
    // Para o `StoreRoleGuard` da resposta da loja
    StoreGuardsModule,
    // Nota média e quantidade de avaliações vão para o índice da busca
    StoreSearchSyncModule,
  ],
  providers: [ReviewService, ReviewSubscriber],
  controllers: [ReviewController],
})
export class ReviewModule {}
