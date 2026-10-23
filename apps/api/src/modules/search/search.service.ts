import { Injectable, Logger } from '@nestjs/common';
import {
  filterAndRankSearchHits,
  parseSearchIntent,
  type TSearchHit,
} from '../../utils/helpers/search-relevance.helpers';
import { UpstashSearchService } from '../upstash-search/upstash-search.service';
import { IStoreSearchContent, IStoreSearchMetadata } from './search.types';

const STORES_INDEX = 'stores';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly upstashService: UpstashSearchService) {}

  /**
   * Index a store for search
   */
  async indexStore(
    storeId: string,
    content: Record<keyof IStoreSearchContent, any>,
    metadata: Record<keyof IStoreSearchMetadata, any>,
  ) {
    try {
      await this.upstashService.upsert(STORES_INDEX, [
        { id: storeId, content, metadata },
      ]);
      this.logger.log(`Store ${storeId} indexed successfully`);
    } catch (error) {
      this.logger.error(`Failed to index store ${storeId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a store from search index
   */
  async deleteStoreIndex(storeId: string) {
    if (!this.upstashService.isAvailable()) {
      this.logger.warn('Upstash service not available, skipping deletion');
      return;
    }

    try {
      await this.upstashService.delete(STORES_INDEX, [storeId]);
      this.logger.log(`Store ${storeId} removed from index`);
    } catch (error) {
      this.logger.error(`Failed to delete store ${storeId} from index:`, error);
      throw error;
    }
  }

  /**
   * Search for stores with category/location relevance filtering.
   * Prefer empty results over irrelevant matches when constraints are present.
   */
  async search(
    query: string,
    options?: {
      filter?: string;
      location?: string;
      category?: string;
    },
  ) {
    try {
      const intent = parseSearchIntent(query, {
        location: options?.location,
        category: options?.category,
      });

      const results = await this.upstashService.search(
        STORES_INDEX,
        intent.searchQuery,
        {
          limit: 100,
          filter: options?.filter,
        },
      );

      const hits = normalizeSearchHits(results);
      const ranked = filterAndRankSearchHits(hits, intent);

      this.logger.debug(
        `Search q="${intent.rawQuery}" → engine="${intent.searchQuery}" loc=${intent.location ?? '-'} cat=${intent.category ?? '-'} raw=${hits.length} kept=${ranked.length}`,
      );

      return ranked;
    } catch (error) {
      this.logger.error('Search failed:', error);
      throw error;
    }
  }

  async searchStore({ storeId }: { storeId: string }) {
    try {
      const results = await this.upstashService.search(STORES_INDEX, '', {
        limit: 100,
        filter: JSON.stringify({
          id: {
            $eq: storeId,
          },
          isActive: true,
        }),
      });

      return normalizeSearchHits(results);
    } catch (error) {
      this.logger.error('Search failed:', error);
      throw error;
    }
  }
}

function normalizeSearchHits(results: unknown): TSearchHit[] {
  if (Array.isArray(results)) {
    return results as TSearchHit[];
  }

  if (
    results &&
    typeof results === 'object' &&
    Array.isArray((results as { results?: unknown }).results)
  ) {
    return (results as { results: TSearchHit[] }).results;
  }

  return [];
}
