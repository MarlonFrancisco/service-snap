import type {
  ISearchResult,
  TStoresSitemap,
} from '../../types/api/search.types';
import { apiClient } from '../api';

export type TSearchStoresParams = {
  query: string;
  location?: string;
  category?: string;
  /** Nota mínima: um de '1', '2', '3', '4', '4.5', '5'. */
  minRating?: string;
  /** Só lojas com horário livre hoje. */
  availableToday?: boolean;
};

export class SearchService {
  static apiClient = apiClient;
  static headers?: HeadersInit;

  static async searchStores(params: string | TSearchStoresParams) {
    const { query, location, category, minRating, availableToday } =
      typeof params === 'string' ? { query: params } : params;

    const searchParams = new URLSearchParams();
    searchParams.set('query', query);
    if (location?.trim()) {
      searchParams.set('location', location.trim());
    }
    if (category?.trim()) {
      searchParams.set('category', category.trim());
    }
    if (minRating?.trim()) {
      searchParams.set('minRating', minRating.trim());
    }
    if (availableToday) {
      searchParams.set('availableToday', 'true');
    }

    return await this.apiClient.get<ISearchResult[]>(
      `/search?${searchParams.toString()}`,
      {
        headers: this.headers,
      },
    );
  }

  static async getSitemap(categories: readonly string[]) {
    const searchParams = new URLSearchParams({
      categories: categories.join(','),
    });
    return await this.apiClient.get<TStoresSitemap>(
      `/search/sitemap?${searchParams.toString()}`,
    );
  }
}
