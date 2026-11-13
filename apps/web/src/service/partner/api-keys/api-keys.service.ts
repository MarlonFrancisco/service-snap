import type {
  IApiKey,
  TCreateApiKey,
  TCreatedApiKey,
} from '@/types/api/api-keys.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

/** Chaves da API pública da loja: só dono e gerente. */
export class ApiKeysService {
  static apiClient: HttpClientService = apiClient;

  static async getAll(storeId: string) {
    return await this.apiClient.get<IApiKey[]>(
      `/partner/stores/${storeId}/api-keys`,
    );
  }

  /** A chave inteira só vem nesta resposta. */
  static async create(storeId: string, apiKey: TCreateApiKey) {
    return await this.apiClient.post<TCreatedApiKey>(
      `/partner/stores/${storeId}/api-keys`,
      apiKey,
    );
  }

  static async revoke(storeId: string, id: string) {
    return await this.apiClient.delete<{ id: string }>(
      `/partner/stores/${storeId}/api-keys/${id}`,
    );
  }
}
