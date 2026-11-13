import type {
  IAdminOverview,
  IAdminStore,
  IAdminStoreRow,
  IAdminUser,
  TAdminListQuery,
  TAdminUpdateStore,
} from '@/types/api/admin.types';
import type { IAuditLog, TAuditLogQuery } from '@/types/api/audit-logs.types';
import type { IPage } from '@/types/api/pagination.types';
import { apiClient } from '../api';
import { HttpClientService } from '../api/http-client.service';
import { toQueryString } from '../partner/audit-logs/audit-logs.helpers';

/** Painel da plataforma: quem não é admin recebe 403. */
export class AdminService {
  static apiClient: HttpClientService = apiClient;

  static async getOverview(headers?: HeadersInit) {
    return await this.apiClient.get<IAdminOverview>('/admin/overview', {
      headers,
    });
  }

  static async getStores(query: TAdminListQuery = {}) {
    return await this.apiClient.get<IPage<IAdminStoreRow>>(
      `/admin/stores${toQueryString({ page: 1, ...query })}`,
    );
  }

  static async getStore(id: string) {
    return await this.apiClient.get<IAdminStore>(`/admin/stores/${id}`);
  }

  /** O motivo vai para o histórico de ações da loja. */
  static async updateStore(id: string, changes: TAdminUpdateStore) {
    return await this.apiClient.patch<IAdminStore>(
      `/admin/stores/${id}`,
      changes,
    );
  }

  static async getUsers(query: TAdminListQuery = {}) {
    return await this.apiClient.get<IPage<IAdminUser>>(
      `/admin/users${toQueryString({ page: 1, ...query })}`,
    );
  }

  static async getAuditLogs(query: TAuditLogQuery = {}) {
    return await this.apiClient.get<IPage<IAuditLog>>(
      `/admin/audit-logs${toQueryString({ page: 1, ...query })}`,
    );
  }
}
