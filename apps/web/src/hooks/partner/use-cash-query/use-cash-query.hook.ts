import { CashService } from '@/service/partner/cash';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  isForbiddenQueryError,
  retryPartnerQuery,
} from './use-cash-query.helpers';
import type {
  TUseCashQueryConfig,
  TUseCashSessionQueryConfig,
  TUseCashSessionsQueryConfig,
  TUsePaymentsQueryConfig,
} from './use-cash-query.types';

/** Caixa aberto da loja; `null` quando está fechado. Toda a equipe lê. */
export const useCashCurrentQuery = ({
  storeId,
  enabled = true,
}: TUseCashQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.cashCurrent(storeId!),
    queryFn: () => CashService.getCurrent(storeId!),
    enabled: canFetch,
    retry: retryPartnerQuery,
  });

  return {
    currentSession: data ?? null,
    isLoadingCurrent: canFetch && isPending,
    isFetchingCurrent: isFetching,
    isCurrentError: canFetch && isError,
    refetchCurrent: refetch,
  };
};

export const useCashSessionsQuery = ({
  storeId,
  page,
  enabled = true,
}: TUseCashSessionsQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.cashSessions(storeId!, { page }),
    queryFn: () => CashService.getSessions(storeId!, page),
    enabled: canFetch,
    placeholderData: keepPreviousData,
    retry: retryPartnerQuery,
  });

  return {
    sessions: data?.data ?? [],
    sessionsMeta: data?.meta,
    isLoadingSessions: canFetch && isPending,
    isFetchingSessions: isFetching,
    isSessionsError: canFetch && isError,
    isSessionsForbidden: isForbiddenQueryError(error),
    refetchSessions: refetch,
  };
};

export const useCashSessionQuery = ({
  storeId,
  sessionId,
  enabled = true,
}: TUseCashSessionQueryConfig) => {
  const canFetch = enabled && !!storeId && !!sessionId;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.cashSession(storeId!, sessionId!),
    queryFn: () => CashService.getSession(storeId!, sessionId!),
    enabled: canFetch,
    retry: retryPartnerQuery,
  });

  return {
    session: data,
    isLoadingSession: canFetch && isPending,
    isSessionError: canFetch && isError,
    refetchSession: refetch,
  };
};

/** Pagamentos de um período, com origem (atendimento, pacote ou avulso). */
export const usePaymentsQuery = ({
  storeId,
  query,
  enabled = true,
}: TUsePaymentsQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.payments(storeId!, query),
    queryFn: () => CashService.getPayments(storeId!, query),
    enabled: canFetch,
    placeholderData: keepPreviousData,
    retry: retryPartnerQuery,
  });

  return {
    payments: data?.payments ?? [],
    paymentsSummary: data?.summary,
    isLoadingPayments: canFetch && isPending,
    isFetchingPayments: isFetching,
    isPaymentsError: canFetch && isError,
    isPaymentsForbidden: isForbiddenQueryError(error),
    refetchPayments: refetch,
  };
};
