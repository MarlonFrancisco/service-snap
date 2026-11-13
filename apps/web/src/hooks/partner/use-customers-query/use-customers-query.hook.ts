import { isApiHttpError } from '@/service/api';
import { CustomersService } from '@/service/partner/customers';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type {
  TUseCustomerHistoryQueryConfig,
  TUseCustomerQueryConfig,
  TUseCustomersQueryConfig,
} from './use-customers-query.types';

const SEARCH_DEBOUNCE_MS = 350;
const NO_RETRY_STATUS = [400, 401, 403, 404];

/** Sem acesso ou sem cliente não melhora tentando de novo. */
const retryCustomers = (failureCount: number, error: unknown) =>
  !(isApiHttpError(error) && NO_RETRY_STATUS.includes(error.status)) &&
  failureCount < 2;

export const isForbiddenError = (error: unknown) =>
  isApiHttpError(error) && error.status === 403;

/** Valor que só muda depois de a pessoa parar de digitar. */
export const useCustomersSearchTerm = (value: string) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebounced(value.trim()),
      SEARCH_DEBOUNCE_MS,
    );

    return () => clearTimeout(timeout);
  }, [value]);

  return debounced;
};

export const useCustomersQuery = ({
  storeId,
  page = 1,
  limit,
  search,
  tag,
  enabled = true,
}: TUseCustomersQueryConfig) => {
  const params = { page, limit, search: search || undefined, tag };
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.customers(storeId!, params),
    queryFn: () => CustomersService.getAll(storeId!, params),
    enabled: canFetch,
    placeholderData: keepPreviousData,
    retry: retryCustomers,
  });

  return {
    customers: data?.data ?? [],
    customersMeta: data?.meta,
    isLoadingCustomers: canFetch && isPending,
    isFetchingCustomers: isFetching,
    isCustomersError: canFetch && isError,
    isCustomersForbidden: isForbiddenError(error),
    refetchCustomers: refetch,
  };
};

export const useCustomerTagsQuery = ({
  storeId,
  enabled = true,
}: Omit<TUseCustomerQueryConfig, 'userId'>) => {
  const { data: tags = [] } = useQuery({
    queryKey: CACHE_QUERY_KEYS.customerTags(storeId!),
    queryFn: () => CustomersService.getTags(storeId!),
    enabled: enabled && !!storeId,
    retry: retryCustomers,
  });

  return { tags };
};

export const useCustomerQuery = ({
  storeId,
  userId,
  enabled = true,
}: TUseCustomerQueryConfig) => {
  const canFetch = enabled && !!storeId && !!userId;

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.customer(storeId!, userId!),
    queryFn: () => CustomersService.get(storeId!, userId!),
    enabled: canFetch,
    retry: retryCustomers,
  });

  return {
    customer: data,
    isLoadingCustomer: canFetch && isPending,
    isFetchingCustomer: isFetching,
    isCustomerError: canFetch && isError,
    isCustomerForbidden: isForbiddenError(error),
    // 400 é id fora do formato: para quem abriu, é o mesmo que não existir
    isCustomerNotFound:
      isApiHttpError(error) && [400, 404].includes(error.status),
    refetchCustomer: refetch,
  };
};

export const useCustomerHistoryQuery = ({
  storeId,
  userId,
  page,
  limit,
  enabled = true,
}: TUseCustomerHistoryQueryConfig) => {
  const canFetch = enabled && !!storeId && !!userId;

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.customerHistory(storeId!, userId!, page),
    queryFn: () =>
      CustomersService.getHistory(storeId!, userId!, { page, limit }),
    enabled: canFetch,
    placeholderData: keepPreviousData,
    retry: retryCustomers,
  });

  return {
    history: data?.data ?? [],
    historyMeta: data?.meta,
    isLoadingHistory: canFetch && isPending,
    isFetchingHistory: isFetching,
    isHistoryError: canFetch && isError,
    refetchHistory: refetch,
  };
};
