import type { TAdminListQuery } from '@/types/api/admin.types';
import type { TAuditLogQuery } from '@/types/api/audit-logs.types';

export type TUseAdminListQueryConfig = TAdminListQuery & {
  enabled?: boolean;
};

export type TUseAdminStoreQueryConfig = {
  storeId?: string | null;
};

export type TUseAdminAuditLogsQueryConfig = TAuditLogQuery & {
  enabled?: boolean;
};
