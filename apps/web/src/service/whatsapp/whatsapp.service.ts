import type {
  IWhatsappConfigPayload,
  IWhatsappConfigResponse,
  IWhatsappStatusResponse,
  IWhatsappTemplateSummary,
  IWhatsappTestPayload,
  IWhatsappTestResponse,
} from '@/types/api/whatsapp.types';
import { apiClient } from '../api';

export class WhatsappService {
  static apiClient = apiClient;

  public static async saveConfig(config: IWhatsappConfigPayload) {
    const response = await this.apiClient.post<IWhatsappConfigResponse>(
      `/partner/stores/${config.store.id}/whatsapp`,
      config,
    );

    return response;
  }

  public static async getConfig(storeId: string) {
    const response = await this.apiClient.get<IWhatsappConfigResponse>(
      `/partner/stores/${storeId}/whatsapp`,
    );

    return response;
  }

  public static async getStatus(storeId: string) {
    const response = await this.apiClient.get<
      IWhatsappStatusResponse | { statusCode?: number; message?: string }
    >(`/partner/stores/${storeId}/whatsapp/status`);
    assertApiOk(response);
    return response as IWhatsappStatusResponse;
  }

  public static async getTemplates(storeId: string) {
    const response = await this.apiClient.get<
      IWhatsappTemplateSummary[] | { statusCode?: number; message?: string }
    >(`/partner/stores/${storeId}/whatsapp/templates`);
    assertApiOk(response);
    return response as IWhatsappTemplateSummary[];
  }

  public static async sendTest(storeId: string, payload: IWhatsappTestPayload) {
    const response = await this.apiClient.post<
      IWhatsappTestResponse | { statusCode?: number; message?: string }
    >(`/partner/stores/${storeId}/whatsapp/test`, payload);
    assertApiOk(response);
    return response as IWhatsappTestResponse;
  }
}

function assertApiOk(response: unknown) {
  if (
    response &&
    typeof response === 'object' &&
    'statusCode' in response &&
    typeof (response as { statusCode?: number }).statusCode === 'number' &&
    (response as { statusCode: number }).statusCode >= 400
  ) {
    const message = (response as { message?: string | string[] }).message;
    throw new Error(
      Array.isArray(message)
        ? message.join(', ')
        : message || 'Falha na requisição WhatsApp',
    );
  }
}
