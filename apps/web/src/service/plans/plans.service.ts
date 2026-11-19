import { IPlansResponse } from '@/types/api';
import { HttpClientService, apiClient } from '../api';

export class PlansService {
  static readonly apiClient: HttpClientService = apiClient;

  /**
   * A moeda dos planos é do Stripe, não do seletor de região (#23, #24): o
   * frontend não escolhe nem converte. Mostra o que a API devolve.
   */
  static async getPlans() {
    return await this.apiClient.get<IPlansResponse>('/plans');
  }
}
