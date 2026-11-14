import type {
  IWebhookDelivery,
  IWebhookEndpoint,
  TCreateWebhookEndpoint,
  TCreatedWebhookEndpoint,
  TUpdateWebhookEndpoint,
  TWebhookPingResult,
  TWebhookRetryResult,
  TWebhookSecret,
} from '@/types/api/webhooks.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

const basePath = (storeId: string) => `/partner/stores/${storeId}/webhooks`;

/** Webhooks da loja: só dono e gerente. */
export class WebhooksService {
  static apiClient: HttpClientService = apiClient;

  static async getAll(storeId: string) {
    return await this.apiClient.get<IWebhookEndpoint[]>(basePath(storeId));
  }

  /** O segredo inteiro volta só aqui, na troca e ao mostrar. */
  static async create(storeId: string, endpoint: TCreateWebhookEndpoint) {
    return await this.apiClient.post<TCreatedWebhookEndpoint>(
      basePath(storeId),
      endpoint,
    );
  }

  static async update(
    storeId: string,
    id: string,
    changes: TUpdateWebhookEndpoint,
  ) {
    return await this.apiClient.patch<IWebhookEndpoint>(
      `${basePath(storeId)}/${id}`,
      changes,
    );
  }

  static async remove(storeId: string, id: string) {
    return await this.apiClient.delete<{ id: string }>(
      `${basePath(storeId)}/${id}`,
    );
  }

  /** Fica registrado no histórico de ações da loja. */
  static async revealSecret(storeId: string, id: string) {
    return await this.apiClient.get<TWebhookSecret>(
      `${basePath(storeId)}/${id}/secret`,
    );
  }

  /** O segredo antigo deixa de valer na hora. */
  static async rotateSecret(storeId: string, id: string) {
    return await this.apiClient.post<TWebhookSecret>(
      `${basePath(storeId)}/${id}/secret/rotate`,
      {},
    );
  }

  static async sendTest(storeId: string, id: string) {
    return await this.apiClient.post<TWebhookPingResult>(
      `${basePath(storeId)}/${id}/test`,
      {},
    );
  }

  static async getDeliveries(storeId: string, id: string) {
    return await this.apiClient.get<IWebhookDelivery[]>(
      `${basePath(storeId)}/${id}/deliveries`,
    );
  }

  /** Entra na fila: a entrega passa de `pending` para o resultado depois. */
  static async retryDelivery(storeId: string, id: string, deliveryId: string) {
    return await this.apiClient.post<TWebhookRetryResult>(
      `${basePath(storeId)}/${id}/deliveries/${deliveryId}/retry`,
      {},
    );
  }
}
