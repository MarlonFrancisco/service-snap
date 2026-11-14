import type {
  ICampaign,
  ICampaignDetail,
  IInactiveCustomer,
  TCreateCampaign,
  TMarketingOptOutResponse,
} from '@/types/api/campaigns.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

/** Campanha fala em nome da loja com a base toda: só dono e gerente. */
export class CampaignsService {
  static apiClient: HttpClientService = apiClient;

  static async getInactiveCustomers(storeId: string, inactiveDays: number) {
    return await this.apiClient.get<IInactiveCustomer[]>(
      `/partner/stores/${storeId}/campaigns/inactive-customers?days=${inactiveDays}`,
    );
  }

  static async getAll(storeId: string) {
    return await this.apiClient.get<ICampaign[]>(
      `/partner/stores/${storeId}/campaigns`,
    );
  }

  static async get(storeId: string, id: string) {
    return await this.apiClient.get<ICampaignDetail>(
      `/partner/stores/${storeId}/campaigns/${id}`,
    );
  }

  static async create(storeId: string, campaign: TCreateCampaign) {
    return await this.apiClient.post<ICampaignDetail>(
      `/partner/stores/${storeId}/campaigns`,
      campaign,
    );
  }

  /** A loja anota que o cliente não quer mais campanhas. */
  static async optOut(storeId: string, customerId: string) {
    return await this.apiClient.post<TMarketingOptOutResponse>(
      `/partner/stores/${storeId}/customers/${customerId}/marketing-opt-out`,
      {},
    );
  }

  static async optIn(storeId: string, customerId: string) {
    return await this.apiClient.delete<TMarketingOptOutResponse>(
      `/partner/stores/${storeId}/customers/${customerId}/marketing-opt-out`,
    );
  }
}
