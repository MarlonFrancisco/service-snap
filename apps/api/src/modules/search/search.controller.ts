import { Controller, Get, Query } from '@nestjs/common';
import { parseSitemapCategories } from './search.helpers';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('sitemap')
  async sitemap(@Query('categories') categories?: string) {
    return this.searchService.getSitemap(parseSitemapCategories(categories));
  }

  @Get()
  async search(
    @Query('query') query: string,
    @Query('location') location?: string,
    @Query('category') category?: string,
  ) {
    return this.searchService.search(query ?? '', {
      location,
      category,
    });
  }
}
