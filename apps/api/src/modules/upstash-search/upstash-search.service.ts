import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Search } from '@upstash/search';

export interface UpstashSearchIndexConfig {
  indexName: string;
  contentSchema?: Record<string, string>;
  metadataSchema?: Record<string, string>;
}

@Injectable()
export class UpstashSearchService {
  private readonly logger = new Logger(UpstashSearchService.name);
  private client: Search | null = null;
  private indexes: Map<string, ReturnType<typeof this.client.index>> =
    new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeClient();
  }

  private initializeClient() {
    const upstashSearchRestUrl = this.configService.get(
      'UPSTASH_SEARCH_REST_URL',
    );
    const upstashSearchRestToken = this.configService.get(
      'UPSTASH_SEARCH_REST_TOKEN',
    );

    if (!upstashSearchRestUrl || !upstashSearchRestToken) {
      this.logger.warn(
        'Upstash credentials not configured - search functionality disabled',
      );
      return;
    }

    this.client = new Search({
      url: upstashSearchRestUrl,
      token: upstashSearchRestToken,
    });
  }

  /**
   * Get or create an index
   */
  private getIndex(indexName: string) {
    if (!this.client) {
      this.logger.warn('Upstash client not initialized');
      return null;
    }

    if (!this.indexes.has(indexName)) {
      this.indexes.set(indexName, this.client.index(indexName));
    }

    return this.indexes.get(indexName);
  }

  /**
   * Check if client is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Upsert documents into an index
   */
  async upsert(
    indexName: string,
    documents: Array<{
      id: string;
      content: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }>,
  ) {
    const index = this.getIndex(indexName);

    if (!index) {
      this.logger.warn(
        `Cannot upsert into index ${indexName}: client not available`,
      );
      return;
    }

    try {
      await index.upsert(documents);
      this.logger.log(
        `Successfully upserted ${documents.length} documents into index ${indexName}`,
      );
    } catch (error) {
      this.logger.error(`Failed to upsert into index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Search documents in an index
   */
  async search(
    indexName: string,
    query: string,
    options?: {
      limit?: number;
      filter?: string;
    },
  ) {
    const index = this.getIndex(indexName);

    if (!index) {
      this.logger.warn(
        `Cannot search in index ${indexName}: client not available`,
      );
      return [];
    }

    try {
      const results = await index.search({
        query: query || '*',
        limit: options?.limit ?? 100,
        filter: options?.filter,
      });

      return Array.isArray(results) ? results : [];
    } catch (error) {
      this.logger.error(`Search failed in index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Delete documents from an index
   */
  async delete(indexName: string, ids: string[]) {
    const index = this.getIndex(indexName);

    if (!index) {
      this.logger.warn(
        `Cannot delete from index ${indexName}: client not available`,
      );
      return;
    }

    try {
      await index.delete({ ids });
      this.logger.log(
        `Successfully deleted ${ids.length} documents from index ${indexName}`,
      );
    } catch (error) {
      this.logger.error(`Failed to delete from index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Get index information
   */
  async getIndexInfo(indexName: string) {
    const index = this.getIndex(indexName);

    if (!index) {
      return null;
    }

    try {
      return await index.info();
    } catch (error) {
      this.logger.error(`Failed to get info for index ${indexName}:`, error);
      return null;
    }
  }
}
