import { Injectable, Logger } from '@nestjs/common';
import {
  filterAndRankSearchHits,
  matchesSearchFilters,
  parseSearchIntent,
  type TSearchHit,
} from '../../utils/helpers/search-relevance.helpers';
import { UpstashSearchService } from '../upstash-search/upstash-search.service';
import { buildCategoryCitySitemap, sitemapUpdatedAt } from './search.helpers';
import type {
  IStoreSearchContent,
  IStoreSearchMetadata,
  TSearchFilters,
  TStoresSitemap,
} from './search.types';

const STORES_INDEX = 'stores';
/** Máximo que o `range` do Upstash aceita por chamada ("max allowed read limit"). */
const SITEMAP_PAGE_SIZE = 100;
/** Trava contra cursor que nunca termina: 50 mil lojas, o teto de um sitemap. */
const SITEMAP_MAX_PAGES = 500;

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
    // Partial: os campos novos são opcionais em documentos antigos
    metadata: Partial<Record<keyof IStoreSearchMetadata, any>>,
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
    } & TSearchFilters,
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
      const ranked = filterAndRankSearchHits(hits, intent).filter((hit) =>
        matchesSearchFilters(hit, options ?? {}),
      );

      this.logger.debug(
        `Search q="${intent.rawQuery}" → engine="${intent.searchQuery}" loc=${intent.location ?? '-'} cat=${intent.category ?? '-'} raw=${hits.length} kept=${ranked.length}`,
      );

      return ranked;
    } catch (error) {
      this.logger.error('Search failed:', error);
      throw error;
    }
  }

  /**
   * Lojas do índice e os pares categoria + cidade que elas preenchem, para o
   * `sitemap.xml` do web. O índice só guarda quem passou em
   * `availableToIndexStore`, então tudo aqui dá para agendar.
   */
  async getSitemap(categories: string[]): Promise<TStoresSitemap> {
    const hits: TSearchHit[] = [];
    let cursor = '0';

    for (let page = 0; page < SITEMAP_MAX_PAGES; page += 1) {
      const { nextCursor, documents } = await this.upstashService.range(
        STORES_INDEX,
        { cursor, limit: SITEMAP_PAGE_SIZE },
      );

      hits.push(...(documents as TSearchHit[]));

      if (!nextCursor || nextCursor === cursor) break;
      cursor = nextCursor;
    }

    return {
      stores: hits.map((hit) => ({
        id: hit.id,
        updatedAt: sitemapUpdatedAt(hit),
      })),
      categoryCities: buildCategoryCitySitemap(hits, categories),
    };
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
