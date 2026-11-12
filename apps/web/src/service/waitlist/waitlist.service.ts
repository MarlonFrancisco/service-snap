import type {
  IJoinWaitlistPayload,
  IWaitlistEntry,
} from '@/types/api/waitlist.types';
import { apiClient } from '../api';
import { HttpClientService } from '../api/http-client.service';

export class WaitlistService {
  static apiClient: HttpClientService = apiClient;

  static async join(storeId: string, payload: IJoinWaitlistPayload) {
    return await this.apiClient.post<IWaitlistEntry>(
      `/partner/stores/${storeId}/waitlist`,
      payload,
    );
  }

  /** Filas abertas do cliente logado nesta loja. */
  static async getByStore(storeId: string) {
    return await this.apiClient.get<IWaitlistEntry[]>(
      `/partner/stores/${storeId}/waitlist`,
    );
  }

  static async leave(storeId: string, entryId: string) {
    return await this.apiClient.delete<{ id: string }>(
      `/partner/stores/${storeId}/waitlist/${entryId}`,
    );
  }

  /** Filas abertas do cliente logado em todas as lojas. */
  static async getMine() {
    return await this.apiClient.get<IWaitlistEntry[]>('/users/me/waitlist');
  }
}
