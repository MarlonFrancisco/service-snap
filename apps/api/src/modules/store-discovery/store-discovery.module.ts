import { Module } from '@nestjs/common';
import { ScheduleModule } from '../partner/stores/schedule';
import { SearchModule } from '../search/search.module';
import { StoreDiscoveryController } from './store-discovery.controller';
import { StoreDiscoveryService } from './store-discovery.service';

/**
 * Busca do cliente. Fica fora do `SearchModule` porque precisa da agenda, e a
 * agenda já depende do `SearchModule` (via guards, membros e sincronização do
 * índice): juntar os dois criaria uma dependência circular.
 */
@Module({
  imports: [SearchModule, ScheduleModule],
  providers: [StoreDiscoveryService],
  controllers: [StoreDiscoveryController],
})
export class StoreDiscoveryModule {}
