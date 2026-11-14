import { ApiKeysService } from '@/service/partner/api-keys';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import {
  isForbidden,
  retryUnlessDenied,
} from '../use-audit-logs-query/use-audit-logs-query.helpers';
import type { TUseApiKeysQueryConfig } from './use-api-keys-query.types';

export const useApiKeysQuery = ({
  storeId,
  enabled = true,
}: TUseApiKeysQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.apiKeys(storeId!),
    queryFn: () => ApiKeysService.getAll(storeId!),
    enabled: canFetch,
    retry: retryUnlessDenied,
  });

  return {
    apiKeys: data ?? [],
    isLoadingApiKeys: canFetch && isPending,
    isFetchingApiKeys: isFetching,
    isApiKeysError: canFetch && isError,
    isApiKeysForbidden: isForbidden(error),
    refetchApiKeys: refetch,
  };
};
