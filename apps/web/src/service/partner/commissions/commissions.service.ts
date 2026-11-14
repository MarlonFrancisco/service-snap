import type {
  ICommissionReport,
  ICommissionRule,
  TCommissionReportQuery,
  TCreateCommissionRule,
} from '@/types/api/commissions.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

const toQuery = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams(
    Object.entries(params).filter(
      (entry): entry is [string, string] => !!entry[1],
    ),
  );

  return search.size ? `?${search}` : '';
};

/** Regras e relatório são de dono e gerente; o profissional usa `me`. */
export class CommissionsService {
  static apiClient: HttpClientService = apiClient;

  static async getRules(storeId: string) {
    return await this.apiClient.get<ICommissionRule[]>(
      `/partner/stores/${storeId}/commissions/rules`,
    );
  }

  static async createRule(storeId: string, rule: TCreateCommissionRule) {
    return await this.apiClient.post<{ id: string }>(
      `/partner/stores/${storeId}/commissions/rules`,
      rule,
    );
  }

  static async deleteRule(storeId: string, id: string) {
    return await this.apiClient.delete<{ id: string }>(
      `/partner/stores/${storeId}/commissions/rules/${id}`,
    );
  }

  static async getReport(storeId: string, query: TCommissionReportQuery) {
    return await this.apiClient.get<ICommissionReport>(
      `/partner/stores/${storeId}/commissions/report${toQuery(query)}`,
    );
  }

  static async getMine(storeId: string, query: TCommissionReportQuery) {
    return await this.apiClient.get<ICommissionReport>(
      `/partner/stores/${storeId}/commissions/me${toQuery(query)}`,
    );
  }
}
