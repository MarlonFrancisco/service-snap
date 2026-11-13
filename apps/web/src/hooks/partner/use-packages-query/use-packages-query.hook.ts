import { isApiHttpError } from '@/service/api';
import { PackagesService } from '@/service/partner/packages';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import type {
  TUseCustomerPackagesQueryConfig,
  TUseServicePackagesQueryConfig,
} from './use-packages-query.types';

const NO_RETRY_STATUS = [400, 401, 403, 404];

/** Sem acesso ou sem cliente não melhora tentando de novo. */
const retryPackages = (failureCount: number, error: unknown) =>
  !(isApiHttpError(error) && NO_RETRY_STATUS.includes(error.status)) &&
  failureCount < 2;

const isForbidden = (error: unknown) =>
  isApiHttpError(error) && error.status === 403;

export const useServicePackagesQuery = ({
  storeId,
  enabled = true,
}: TUseServicePackagesQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.servicePackages(storeId!),
    queryFn: () => PackagesService.getAll(storeId!),
    enabled: canFetch,
    retry: retryPackages,
  });

  return {
    packages: data ?? [],
    isLoadingPackages: canFetch && isPending,
    isFetchingPackages: isFetching,
    isPackagesError: canFetch && isError,
    isPackagesForbidden: isForbidden(error),
    refetchPackages: refetch,
  };
};

export const useCustomerPackagesQuery = ({
  storeId,
  customerId,
  enabled = true,
}: TUseCustomerPackagesQueryConfig) => {
  const canFetch = enabled && !!storeId && !!customerId;

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.customerPackages(storeId!, customerId!),
    queryFn: () => PackagesService.getForCustomer(storeId!, customerId!),
    enabled: canFetch,
    retry: retryPackages,
  });

  return {
    customerPackages: data ?? [],
    isLoadingCustomerPackages: canFetch && isPending,
    isFetchingCustomerPackages: isFetching,
    isCustomerPackagesError: canFetch && isError,
    refetchCustomerPackages: refetch,
  };
};
