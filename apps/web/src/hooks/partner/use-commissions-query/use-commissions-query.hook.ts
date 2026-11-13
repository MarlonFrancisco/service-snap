import { CommissionsService } from '@/service/partner/commissions';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  isForbiddenQueryError,
  retryPartnerQuery,
} from '../use-cash-query/use-cash-query.helpers';
import type {
  TUseCommissionReportQueryConfig,
  TUseCommissionRulesQueryConfig,
} from './use-commissions-query.types';

/** Todas as versões, da mais nova à mais antiga. Só dono e gerente. */
export const useCommissionRulesQuery = ({
  storeId,
  enabled = true,
}: TUseCommissionRulesQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.commissionRules(storeId!),
    queryFn: () => CommissionsService.getRules(storeId!),
    enabled: canFetch,
    retry: retryPartnerQuery,
  });

  return {
    rules: data ?? [],
    isLoadingRules: canFetch && isPending,
    isRulesError: canFetch && isError,
    refetchRules: refetch,
  };
};

/** Relatório da equipe (dono e gerente) ou o do próprio profissional. */
export const useCommissionReportQuery = ({
  storeId,
  query,
  scope,
  enabled = true,
}: TUseCommissionReportQueryConfig) => {
  const canFetch = enabled && !!storeId;
  const isMine = scope === 'me';

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: isMine
      ? CACHE_QUERY_KEYS.myCommissions(storeId!, query)
      : CACHE_QUERY_KEYS.commissionReport(storeId!, query),
    queryFn: () =>
      isMine
        ? CommissionsService.getMine(storeId!, query)
        : CommissionsService.getReport(storeId!, query),
    enabled: canFetch,
    placeholderData: keepPreviousData,
    retry: retryPartnerQuery,
  });

  return {
    report: data,
    isLoadingReport: canFetch && isPending,
    isFetchingReport: isFetching,
    isReportError: canFetch && isError,
    isReportForbidden: isForbiddenQueryError(error),
    refetchReport: refetch,
  };
};
