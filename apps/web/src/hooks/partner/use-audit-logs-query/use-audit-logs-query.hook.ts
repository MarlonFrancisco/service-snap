import { AuditLogsService } from '@/service/partner/audit-logs';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isForbidden, retryUnlessDenied } from './use-audit-logs-query.helpers';
import type { TUseAuditLogsQueryConfig } from './use-audit-logs-query.types';

export const useAuditLogsQuery = ({
  storeId,
  enabled = true,
  ...query
}: TUseAuditLogsQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.auditLogs(storeId!, query),
    queryFn: () => AuditLogsService.getAll(storeId!, query),
    enabled: canFetch,
    placeholderData: keepPreviousData,
    retry: retryUnlessDenied,
  });

  return {
    auditLogs: data?.data ?? [],
    auditLogsMeta: data?.meta,
    isLoadingAuditLogs: canFetch && isPending,
    isFetchingAuditLogs: isFetching,
    isAuditLogsError: canFetch && isError,
    isAuditLogsForbidden: isForbidden(error),
    refetchAuditLogs: refetch,
  };
};
