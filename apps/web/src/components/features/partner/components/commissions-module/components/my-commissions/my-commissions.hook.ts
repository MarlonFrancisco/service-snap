'use client';

import { useCommissionReportQuery } from '@/hooks/partner/use-commissions-query';
import { useMemo } from 'react';
import { useManagementAccess } from '../../../cash-module/cash-module.hook';
import {
  getCommissionKpis,
  toCommissionLineRow,
} from '../../commissions-module.helpers';
import { useCommissionsPeriod } from '../../commissions-module.hook';

/** Profissional: só a própria comissão, com o mesmo detalhamento. */
export const useMyCommissions = () => {
  const { storeId, storeState, formatMoney } = useManagementAccess();
  const periodState = useCommissionsPeriod();
  const canQuery = storeState === 'ready' && !periodState.periodError;

  const {
    report,
    isLoadingReport,
    isFetchingReport,
    isReportError,
    isReportForbidden,
    refetchReport,
  } = useCommissionReportQuery({
    storeId,
    query: periodState.period,
    scope: 'me',
    enabled: canQuery,
  });

  const kpis = useMemo(
    () => getCommissionKpis(report?.totals, formatMoney),
    [report, formatMoney],
  );

  const rows = useMemo(
    () =>
      (report?.lines ?? []).map((line) =>
        toCommissionLineRow(line, formatMoney),
      ),
    [report, formatMoney],
  );

  return {
    storeState,
    periodState,
    kpis,
    rows,
    isLoading: storeState !== 'ready' || isLoadingReport,
    isError: isReportError && !isReportForbidden,
    isForbidden: isReportForbidden,
    isRefreshing: isFetchingReport && !isLoadingReport,
    handleRetry: () => void refetchReport(),
  };
};
