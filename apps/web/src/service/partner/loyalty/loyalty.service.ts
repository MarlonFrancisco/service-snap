import type {
  ILoyaltyProgram,
  ILoyaltyProgress,
  TRedeemLoyaltyRewardResponse,
  TSaveLoyaltyProgram,
} from '@/types/api/loyalty.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

/** A regra fica com dono e gerente; progresso e resgate, com a equipe. */
export class LoyaltyService {
  static apiClient: HttpClientService = apiClient;

  /** `null` quando a loja ainda não criou o programa. */
  static async getProgram(storeId: string) {
    return await this.apiClient.get<ILoyaltyProgram | null>(
      `/partner/stores/${storeId}/loyalty-program`,
    );
  }

  static async saveProgram(storeId: string, program: TSaveLoyaltyProgram) {
    return await this.apiClient.put<ILoyaltyProgram>(
      `/partner/stores/${storeId}/loyalty-program`,
      program,
    );
  }

  /** `null` quando a loja não tem programa. */
  static async getProgress(storeId: string, customerId: string) {
    return await this.apiClient.get<ILoyaltyProgress | null>(
      `/partner/stores/${storeId}/customers/${customerId}/loyalty`,
    );
  }

  /** Resgate fora do fechamento (ex.: brinde entregue no balcão). */
  static async redeem(storeId: string, rewardId: string) {
    return await this.apiClient.post<TRedeemLoyaltyRewardResponse>(
      `/partner/stores/${storeId}/loyalty-rewards/${rewardId}/redeem`,
      {},
    );
  }
}
