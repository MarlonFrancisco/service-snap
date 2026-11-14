import type {
  IAnamnesisForm,
  IAnamnesisResponse,
  TAnamnesisLink,
  TCreateAnamnesisForm,
  TCustomerAnamnesisEntry,
  TUpdateAnamnesisForm,
} from '@/types/api/anamnesis.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

/**
 * Fichas de anamnese da loja. Formulários são de dono e gerente; abrir as
 * respostas é de gestão e do profissional do atendimento (leitura auditada).
 */
export class AnamnesisService {
  static apiClient: HttpClientService = apiClient;

  static async getForms(storeId: string) {
    return await this.apiClient.get<IAnamnesisForm[]>(
      `/partner/stores/${storeId}/anamnesis-forms`,
    );
  }

  static async createForm(storeId: string, form: TCreateAnamnesisForm) {
    return await this.apiClient.post<IAnamnesisForm>(
      `/partner/stores/${storeId}/anamnesis-forms`,
      form,
    );
  }

  static async updateForm(
    storeId: string,
    formId: string,
    changes: TUpdateAnamnesisForm,
  ) {
    return await this.apiClient.patch<IAnamnesisForm>(
      `/partner/stores/${storeId}/anamnesis-forms/${formId}`,
      changes,
    );
  }

  static async createLink(storeId: string, scheduleId: string) {
    return await this.apiClient.post<TAnamnesisLink>(
      `/partner/stores/${storeId}/schedules/${scheduleId}/anamnesis-link`,
      {},
    );
  }

  static async getCustomerEntries(storeId: string, customerId: string) {
    return await this.apiClient.get<TCustomerAnamnesisEntry[]>(
      `/partner/stores/${storeId}/customers/${customerId}/anamnesis`,
    );
  }

  /** Cada leitura fica no histórico da loja. */
  static async getResponse(storeId: string, responseId: string) {
    return await this.apiClient.get<IAnamnesisResponse>(
      `/partner/stores/${storeId}/anamnesis-responses/${responseId}`,
    );
  }

  /** Pedido de exclusão do cliente feito à loja. */
  static async deleteResponse(storeId: string, responseId: string) {
    return await this.apiClient.delete<{ id: string }>(
      `/partner/stores/${storeId}/anamnesis-responses/${responseId}`,
    );
  }
}
