import { HEADERS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { RecomendationController } from '../../modules/recomendation/recomendation.controller';
import { SearchController } from '../../modules/search/search.controller';
import { StoreDiscoveryController } from '../../modules/store-discovery/store-discovery.controller';
import { PUBLIC_CDN_CACHE_CONTROL } from './public-cache.decorator';

const headersOf = (handler: unknown) =>
  Reflect.getMetadata(HEADERS_METADATA, handler as object);

describe('PublicCdnCache', () => {
  it.each([
    ['GET /search', StoreDiscoveryController.prototype.search],
    ['GET /search/sitemap', SearchController.prototype.sitemap],
    [
      'GET /recommendation/popular-stores',
      RecomendationController.prototype.getRecommendationStores,
    ],
  ])('lets the CDN cache %s', (_route, handler) => {
    expect(headersOf(handler)).toEqual([
      { name: 'Cache-Control', value: PUBLIC_CDN_CACHE_CONTROL },
    ]);
  });
});
