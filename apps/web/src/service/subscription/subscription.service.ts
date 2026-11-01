import { IMySubscription, TCheckoutSessionStatus } from '@/types/api/payment.types';
import { apiClient } from '../api';

export class SubscriptionService {
  static readonly apiClient = apiClient;

  static async createSubscription(priceId: string) {
    return await this.apiClient.post<{ url: string }>('/subscription', {
      priceId,
    });
  }

  static async getCurrentPlan(headers?: HeadersInit) {
    return await this.apiClient.get<IMySubscription>(
      '/subscription/current-plan',
      { headers },
    );
  }

  static async getCheckoutSessionStatus(sessionId: string) {
    return await this.apiClient.get<{ status: TCheckoutSessionStatus }>(
      `/subscription/checkout-session/${encodeURIComponent(sessionId)}`,
    );
  }

  static async cancelSubscription() {
    return await this.apiClient.delete<{ cancelAtPeriodEnd: boolean }>(
      '/subscription',
    );
  }

  static async updateSubscription({
    cancelAtPeriodEnd,
  }: {
    cancelAtPeriodEnd: boolean;
  }) {
    return await this.apiClient.patch<{ cancelAtPeriodEnd: boolean }>(
      '/subscription',
      { cancelAtPeriodEnd },
    );
  }
}
