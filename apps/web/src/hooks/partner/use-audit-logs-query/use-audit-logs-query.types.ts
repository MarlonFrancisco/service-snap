import type { TAuditLogQuery } from '@/types/api/audit-logs.types';

export type TUseAuditLogsQueryConfig = TAuditLogQuery & {
  storeId?: string;
  enabled?: boolean;
};
