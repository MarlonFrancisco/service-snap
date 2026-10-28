import { apiClient } from '../api';

export type TReferralSummary = {
  code: string;
  referredCount: number;
  clientInviteUrl: string;
  partnerInviteUrl: string;
};

export class ReferralService {
  static apiClient = apiClient;
  static headers?: HeadersInit;

  static async getMine() {
    return this.apiClient.get<TReferralSummary>('/users/me/referral', {
      headers: this.headers,
    });
  }
}
