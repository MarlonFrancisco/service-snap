import type { TMarketingOptOutLink } from '@/types/api/campaigns.types';
import { apiClient } from '../api';
import { HttpClientService } from '../api/http-client.service';

/** Link do e-mail de campanha: sem login, só vale para aquele cliente e loja. */
export class MarketingOptOutService {
  static apiClient: HttpClientService = apiClient;

  static async getLink(token: string) {
    return await this.apiClient.get<TMarketingOptOutLink>(
      `/marketing/opt-out/${encodeURIComponent(token)}`,
    );
  }

  /** Repetir não muda nada: quem já saiu continua fora. */
  static async optOut(token: string) {
    return await this.apiClient.post<TMarketingOptOutLink>(
      `/marketing/opt-out/${encodeURIComponent(token)}`,
      {},
    );
  }
}
