import type {
  TAnamnesisInvite,
  TAnamnesisSubmitted,
  TSubmitAnamnesis,
} from '@/types/api/anamnesis.types';
import { apiClient } from '../api';
import { HttpClientService } from '../api/http-client.service';

/** Link que o cliente recebe: sem login, só preenche (nunca lê respostas). */
export class AnamnesisPublicService {
  static apiClient: HttpClientService = apiClient;

  static async getInvite(token: string) {
    return await this.apiClient.get<TAnamnesisInvite>(
      `/anamnesis/${encodeURIComponent(token)}`,
    );
  }

  /** Enviar de novo antes do atendimento substitui as respostas anteriores. */
  static async submit(token: string, submission: TSubmitAnamnesis) {
    return await this.apiClient.post<TAnamnesisSubmitted>(
      `/anamnesis/${encodeURIComponent(token)}`,
      submission,
    );
  }
}
