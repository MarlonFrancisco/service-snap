import type {
  ICashSession,
  ICashSessionDetail,
  ICashSessionsPage,
  IPaymentsList,
  IStorePayment,
  TCloseCashSession,
  TOpenCashSession,
  TPaymentsQuery,
  TRegisterPayment,
} from '@/types/api/cash.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

const toQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)]),
  );

  return search.size ? `?${search}` : '';
};

/**
 * Caixa e pagamentos. Qualquer pessoa da equipe registra o que recebeu; abrir,
 * fechar, estornar e ver o histórico é de dono e gerente.
 */
export class CashService {
  static apiClient: HttpClientService = apiClient;

  /** Caixa aberto com os totais até agora, ou `null`. */
  static async getCurrent(storeId: string) {
    return await this.apiClient.get<ICashSessionDetail | null>(
      `/partner/stores/${storeId}/cash-sessions/current`,
    );
  }

  static async getSessions(storeId: string, page = 1) {
    return await this.apiClient.get<ICashSessionsPage>(
      `/partner/stores/${storeId}/cash-sessions${toQuery({ page })}`,
    );
  }

  static async getSession(storeId: string, id: string) {
    return await this.apiClient.get<ICashSessionDetail>(
      `/partner/stores/${storeId}/cash-sessions/${id}`,
    );
  }

  static async open(storeId: string, session: TOpenCashSession) {
    return await this.apiClient.post<ICashSession>(
      `/partner/stores/${storeId}/cash-sessions`,
      session,
    );
  }

  static async close(storeId: string, id: string, closing: TCloseCashSession) {
    return await this.apiClient.post<ICashSessionDetail>(
      `/partner/stores/${storeId}/cash-sessions/${id}/close`,
      closing,
    );
  }

  static async getPayments(storeId: string, query: TPaymentsQuery) {
    return await this.apiClient.get<IPaymentsList>(
      `/partner/stores/${storeId}/payments${toQuery(query)}`,
    );
  }

  static async registerPayment(storeId: string, payment: TRegisterPayment) {
    return await this.apiClient.post<IStorePayment>(
      `/partner/stores/${storeId}/payments`,
      payment,
    );
  }

  static async voidPayment(storeId: string, id: string, reason: string) {
    return await this.apiClient.post<{ id: string }>(
      `/partner/stores/${storeId}/payments/${id}/void`,
      { reason },
    );
  }
}
