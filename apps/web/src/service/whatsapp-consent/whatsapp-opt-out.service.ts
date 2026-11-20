import type { TWhatsappOptOutLink } from '@/types/api/whatsapp-consent.types';
import { apiClient } from '../api';
import { HttpClientService } from '../api/http-client.service';

/** Link "Deixar de receber por WhatsApp" do e-mail: sem login (#37). */
export class WhatsappOptOutService {
  static apiClient: HttpClientService = apiClient;

  static async getLink(token: string) {
    return await this.apiClient.get<TWhatsappOptOutLink>(
      `/whatsapp/opt-out/${encodeURIComponent(token)}`,
    );
  }

  /** Repetir não muda nada: quem já saiu continua fora. */
  static async optOut(token: string) {
    return await this.apiClient.post<TWhatsappOptOutLink>(
      `/whatsapp/opt-out/${encodeURIComponent(token)}`,
      {},
    );
  }
}
