import type {
  TWhatsappConsentState,
  TWhatsappConsentText,
} from '@/types/api/whatsapp-consent.types';
import { apiClient } from '../api';
import { HttpClientService } from '../api/http-client.service';

/** Versão do texto da caixa do checkout; o texto em si vem da API. */
export const CHECKOUT_CONSENT_VERSION = 'checkout-v2';

const path = (storeId: string, suffix: string) =>
  `/partner/stores/${encodeURIComponent(storeId)}/whatsapp-consent/${suffix}`;

/** Opt-in do cliente final para receber lembretes da loja por WhatsApp (#37). */
export class WhatsappConsentService {
  static apiClient: HttpClientService = apiClient;

  static async getText(storeId: string) {
    return await this.apiClient.get<TWhatsappConsentText>(
      path(storeId, `text?version=${CHECKOUT_CONSENT_VERSION}`),
    );
  }

  static async getMine(storeId: string) {
    return await this.apiClient.get<TWhatsappConsentState>(path(storeId, 'me'));
  }

  static async grant(storeId: string, source: 'checkout' | 'profile') {
    return await this.apiClient.put<TWhatsappConsentState>(
      path(storeId, 'me'),
      {
        textVersion: CHECKOUT_CONSENT_VERSION,
        source,
      },
    );
  }

  /** Hoje só o checkout retira; a API grava `revokedVia=checkout`. */
  static async revoke(storeId: string) {
    return await this.apiClient.delete<TWhatsappConsentState>(
      path(storeId, 'me?via=checkout'),
    );
  }
}
