import { Controller, Get, Query } from '@nestjs/common';
import { PublicCdnCache } from '../../utils/decorators/public-cache.decorator';
import { SearchQueryDto } from './dto/search-query.dto';
import { StoreDiscoveryService } from './store-discovery.service';

@Controller('search')
export class StoreDiscoveryController {
  constructor(private readonly storeDiscoveryService: StoreDiscoveryService) {}

  /** Busca pública: texto, cidade, categoria, nota e vaga hoje. */
  @Get()
  @PublicCdnCache()
  async search(@Query() query: SearchQueryDto) {
    return this.storeDiscoveryService.search(query);
  }
}
