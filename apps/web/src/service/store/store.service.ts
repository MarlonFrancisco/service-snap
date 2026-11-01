import { IStore } from '@/types/api/stores.types';
import { apiClient } from '../api';

export class StoreService {
  static apiClient = apiClient;

  static async getAll(headers?: HeadersInit) {
    return await this.apiClient.get<IStore[]>('/partner/stores', { headers });
  }

  static async get(storeId: string) {
    return await this.apiClient.get<IStore>(`/partner/stores/${storeId}`);
  }

  static async create(store: Partial<IStore>) {
    return await this.apiClient.post<IStore>('/partner/stores', store);
  }

  static async update(store: Partial<IStore>) {
    return await this.apiClient.put<IStore>(
      `/partner/stores/${store.id}`,
      store,
    );
  }

  static async delete(storeId: string) {
    return await this.apiClient.delete<IStore>(`/partner/stores/${storeId}`);
  }
}
