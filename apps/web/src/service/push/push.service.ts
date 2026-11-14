import type {
  IPushPublicKeyResponse,
  IPushSubscriptionPayload,
  IPushUnsubscribePayload,
} from '@/types/api/push.types';
import { apiClient } from '../api';

export class PushService {
  static apiClient = apiClient;

  public static async getPublicKey() {
    return this.apiClient.get<IPushPublicKeyResponse>('/push/public-key');
  }

  public static async subscribe(payload: IPushSubscriptionPayload) {
    await this.apiClient.post<null>('/push/subscriptions', payload);
  }

  public static async unsubscribe(payload: IPushUnsubscribePayload) {
    await this.apiClient.delete<null>('/push/subscriptions', {
      body: JSON.stringify(payload),
    });
  }
}
