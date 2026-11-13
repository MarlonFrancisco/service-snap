import type {
  ICheckout,
  ICheckoutPreview,
  TCreateCheckout,
} from '@/types/api/checkout.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

/** Fechar o atendimento: quem atende fecha; desfazer é de dono e gerente. */
export class CheckoutService {
  static apiClient: HttpClientService = apiClient;

  static async preview(storeId: string, scheduleIds: string[]) {
    const query = new URLSearchParams({ scheduleIds: scheduleIds.join(',') });

    return await this.apiClient.get<ICheckoutPreview>(
      `/partner/stores/${storeId}/checkouts/preview?${query}`,
    );
  }

  static async get(storeId: string, id: string) {
    return await this.apiClient.get<ICheckout>(
      `/partner/stores/${storeId}/checkouts/${id}`,
    );
  }

  static async create(storeId: string, checkout: TCreateCheckout) {
    return await this.apiClient.post<ICheckout>(
      `/partner/stores/${storeId}/checkouts`,
      checkout,
    );
  }

  static async undo(storeId: string, id: string) {
    return await this.apiClient.delete<{ id: string }>(
      `/partner/stores/${storeId}/checkouts/${id}`,
    );
  }
}
