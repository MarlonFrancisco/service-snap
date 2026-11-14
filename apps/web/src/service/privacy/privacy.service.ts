import type { TUserDataExport } from '@/types/api/privacy.types';
import { apiClient } from '../api';
import { HttpClientService } from '../api/http-client.service';

/** Direitos do titular (LGPD) sobre a própria conta. */
export class PrivacyService {
  static apiClient: HttpClientService = apiClient;

  /** A API manda JSON; a tela transforma em arquivo para baixar. */
  static async exportData() {
    return await this.apiClient.get<TUserDataExport>('/users/me/export');
  }

  /** Definitivo. Dono com assinatura ativa recebe 409. */
  static async deleteAccount() {
    return await this.apiClient.delete<{ id: string }>('/users/me');
  }
}
