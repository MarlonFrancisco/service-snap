import type { ISearchResult } from '../../types/api/search.types';
import { apiClient } from '../api';

export type TSearchStoresParams = {
  query: string;
  location?: string;
  category?: string;
};

export class SearchService {
  static apiClient = apiClient;
  static headers?: HeadersInit;

  static async searchStores(params: string | TSearchStoresParams) {
    const { query, location, category } =
      typeof params === 'string' ? { query: params } : params;

    const searchParams = new URLSearchParams();
    searchParams.set('query', query);
    if (location?.trim()) {
      searchParams.set('location', location.trim());
    }
    if (category?.trim()) {
      searchParams.set('category', category.trim());
    }

    return await this.apiClient.get<ISearchResult[]>(
      `/search?${searchParams.toString()}`,
      {
        headers: this.headers,
      },
    );
  }
}
