import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { useAnalytics } from '@/providers/analytics.provider';
import { usePartnerStore } from '@/store/partner/partner.store';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQueryClient } from '@tanstack/react-query';
import type { TDashboardSection } from '@repo/analytics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  TPeriodFilterValue,
  TUseMetricsViewConfig,
} from './dashboard-module.types';
import {
  createMoneyFormatters,
  resolveMetricsView,
} from './utils/metrics.helpers';

export const useMetricsStore = () => {
  const activeStore = usePartnerStore((state) => state.activeStore);
  const { stores, isPendingStores, isError } = useStoresQuery();

  const storeId = activeStore?.id || undefined;
  const { currency, country } = activeStore;

  const money = useMemo(
    () => createMoneyFormatters(currency, country),
    [currency, country],
  );

  return {
    activeStore,
    storeId,
    money,
    isStoreLoading: !storeId && (isPendingStores || stores.length > 0),
    hasStoreError: !storeId && isError,
    hasNoStore: !storeId && !isPendingStores && !isError && stores.length === 0,
  };
};

/** Período do filtro de cada seção; toda troca vira `dashboard_period_changed`. */
export const useMetricsPeriod = (
  section: TDashboardSection,
  initialPeriod: TPeriodFilterValue,
) => {
  const analytics = useAnalytics();
  const [period, setPeriodState] = useState<TPeriodFilterValue>(initialPeriod);

  const setPeriod = useCallback(
    (nextPeriod: TPeriodFilterValue) => {
      if (nextPeriod !== period) {
        analytics.track('dashboard_period_changed', {
          section,
          period: nextPeriod,
        });
      }

      setPeriodState(nextPeriod);
    },
    [analytics, period, section],
  );

  return { period, setPeriod };
};

export const useMetricsView = ({
  section,
  isPending,
  isError,
  isFetching,
  hasData,
  hasActivity,
  refetch,
}: TUseMetricsViewConfig) => {
  const analytics = useAnalytics();
  const queryClient = useQueryClient();
  const { storeId, isStoreLoading, hasStoreError, hasNoStore } =
    useMetricsStore();

  // Dispara na transição para erro, não a cada render com erro.
  useEffect(() => {
    if (isError) {
      analytics.track('dashboard_load_failed', { section });
    }
  }, [analytics, isError, section]);

  const view = resolveMetricsView({
    isStoreLoading,
    hasStoreError,
    hasNoStore,
    isPending,
    isError,
    hasData,
    hasActivity,
  });

  const handleRefresh = useCallback(() => {
    analytics.track('dashboard_refreshed', { section });
    void refetch();
  }, [analytics, refetch, section]);

  const handleRetry = useCallback(() => {
    if (storeId) {
      void refetch();
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.stores(),
    });
  }, [queryClient, refetch, storeId]);

  return {
    view,
    isRefreshing: isFetching,
    hasRefreshError: isError && hasData,
    handleRefresh,
    handleRetry,
  };
};
