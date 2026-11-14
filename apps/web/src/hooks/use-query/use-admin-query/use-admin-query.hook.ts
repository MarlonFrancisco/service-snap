import {
  isForbidden,
  retryUnlessDenied,
} from '@/hooks/partner/use-audit-logs-query/use-audit-logs-query.helpers';
import { AdminService } from '@/service/admin';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  TUseAdminAuditLogsQueryConfig,
  TUseAdminListQueryConfig,
  TUseAdminStoreQueryConfig,
} from './use-admin-query.types';

export const useAdminOverviewQuery = () => {
  const { data, isPending, isError, error, isFetching, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.adminOverview(),
    queryFn: () => AdminService.getOverview(),
    retry: retryUnlessDenied,
  });

  return {
    overview: data,
    isLoadingOverview: isPending,
    isOverviewError: isError,
    isOverviewForbidden: isForbidden(error),
    isFetchingOverview: isFetching,
    refetchOverview: refetch,
  };
};

export const useAdminStoresQuery = ({
  enabled = true,
  ...query
}: TUseAdminListQueryConfig) => {
  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.adminStores(query),
    queryFn: () => AdminService.getStores(query),
    enabled,
    placeholderData: keepPreviousData,
    retry: retryUnlessDenied,
  });

  return {
    stores: data?.data ?? [],
    storesMeta: data?.meta,
    isLoadingStores: enabled && isPending,
    isFetchingStores: isFetching,
    isStoresError: enabled && isError,
    isStoresForbidden: isForbidden(error),
    refetchStores: refetch,
  };
};

export const useAdminStoreQuery = ({ storeId }: TUseAdminStoreQueryConfig) => {
  const canFetch = !!storeId;

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.adminStore(storeId!),
    queryFn: () => AdminService.getStore(storeId!),
    enabled: canFetch,
    retry: retryUnlessDenied,
  });

  return {
    store: data,
    isLoadingStore: canFetch && isPending,
    isFetchingStore: isFetching,
    isStoreError: canFetch && isError,
    refetchStore: refetch,
  };
};

export const useAdminUsersQuery = ({
  enabled = true,
  ...query
}: TUseAdminListQueryConfig) => {
  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.adminUsers(query),
    queryFn: () => AdminService.getUsers(query),
    enabled,
    placeholderData: keepPreviousData,
    retry: retryUnlessDenied,
  });

  return {
    users: data?.data ?? [],
    usersMeta: data?.meta,
    isLoadingUsers: enabled && isPending,
    isFetchingUsers: isFetching,
    isUsersError: enabled && isError,
    isUsersForbidden: isForbidden(error),
    refetchUsers: refetch,
  };
};

export const useAdminAuditLogsQuery = ({
  enabled = true,
  ...query
}: TUseAdminAuditLogsQueryConfig) => {
  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.adminAuditLogs(query),
    queryFn: () => AdminService.getAuditLogs(query),
    enabled,
    placeholderData: keepPreviousData,
    retry: retryUnlessDenied,
  });

  return {
    auditLogs: data?.data ?? [],
    auditLogsMeta: data?.meta,
    isLoadingAuditLogs: enabled && isPending,
    isFetchingAuditLogs: isFetching,
    isAuditLogsError: enabled && isError,
    isAuditLogsForbidden: isForbidden(error),
    refetchAuditLogs: refetch,
  };
};
