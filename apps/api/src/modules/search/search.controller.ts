import { Controller, Get, Query } from '@nestjs/common';
import { parseSitemapCategories } from './search.helpers';
import { SearchService } from './search.service';

/**
 * Só o sitemap: a busca em si (`GET /search`) fica no `StoreDiscoveryModule`,
 * que também consulta a agenda para o filtro de vaga hoje.
 */
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('sitemap')
  async sitemap(@Query('categories') categories?: string) {
    return this.searchService.getSitemap(parseSitemapCategories(categories));
  }
}
