import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { usePartnerStore } from '@/store/partner/partner.store';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { TUseMetricsViewConfig } from './dashboard-module.types';
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

export const useMetricsView = ({
  isPending,
  isError,
  isFetching,
  hasData,
  hasActivity,
  refetch,
}: TUseMetricsViewConfig) => {
  const queryClient = useQueryClient();
  const { storeId, isStoreLoading, hasStoreError, hasNoStore } =
    useMetricsStore();

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
    void refetch();
  }, [refetch]);

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
