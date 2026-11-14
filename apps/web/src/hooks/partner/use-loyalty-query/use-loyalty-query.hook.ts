import { isApiHttpError } from '@/service/api';
import { LoyaltyService } from '@/service/partner/loyalty';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import type {
  TUseLoyaltyProgramQueryConfig,
  TUseLoyaltyProgressQueryConfig,
} from './use-loyalty-query.types';

const NO_RETRY_STATUS = [400, 401, 403, 404];

const retryLoyalty = (failureCount: number, error: unknown) =>
  !(isApiHttpError(error) && NO_RETRY_STATUS.includes(error.status)) &&
  failureCount < 2;

export const useLoyaltyProgramQuery = ({
  storeId,
  enabled = true,
}: TUseLoyaltyProgramQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.loyaltyProgram(storeId!),
    queryFn: () => LoyaltyService.getProgram(storeId!),
    enabled: canFetch,
    retry: retryLoyalty,
  });

  return {
    /** `null` quando a loja ainda não criou o programa. */
    program: data ?? null,
    isLoadingProgram: canFetch && isPending,
    isFetchingProgram: isFetching,
    isProgramError: canFetch && isError,
    refetchProgram: refetch,
  };
};

export const useLoyaltyProgressQuery = ({
  storeId,
  customerId,
  enabled = true,
}: TUseLoyaltyProgressQueryConfig) => {
  const canFetch = enabled && !!storeId && !!customerId;

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.loyaltyProgress(storeId!, customerId!),
    queryFn: () => LoyaltyService.getProgress(storeId!, customerId!),
    enabled: canFetch,
    retry: retryLoyalty,
  });

  return {
    progress: data ?? null,
    isLoadingProgress: canFetch && isPending,
    isFetchingProgress: isFetching,
    isProgressError: canFetch && isError,
    refetchProgress: refetch,
  };
};
