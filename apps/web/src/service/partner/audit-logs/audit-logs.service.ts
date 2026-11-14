import type { IAuditLog, TAuditLogQuery } from '@/types/api/audit-logs.types';
import type { IPage } from '@/types/api/pagination.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';
import { toQueryString } from './audit-logs.helpers';

/** Histórico de ações da loja: só dono e gerente. */
export class AuditLogsService {
  static apiClient: HttpClientService = apiClient;

  static async getAll(storeId: string, query: TAuditLogQuery = {}) {
    return await this.apiClient.get<IPage<IAuditLog>>(
      `/partner/stores/${storeId}/audit-logs${toQueryString({ page: 1, ...query })}`,
    );
  }
}
