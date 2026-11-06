import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useStoresStore } from '@/store';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getPlanUsage } from './utils/stores-module.helpers';

export const useStoresModule = () => {
  const { stores, isPendingStores, isError } = useStoresQuery();
  const { setIsAddModalOpen } = useStoresStore();
  const { currentPlan } = useSubscriptionQuery();
  const queryClient = useQueryClient();

  const isFetchingStores =
    useIsFetching({ queryKey: CACHE_QUERY_KEYS.stores() }) > 0;

  const storesUsage = useMemo(
    () =>
      currentPlan
        ? getPlanUsage(currentPlan.storesLength, currentPlan.features.UNIT_LIMIT)
        : null,
    [currentPlan],
  );

  const analytics = useAnalytics();
  const hasTrackedLimitRef = useRef(false);

  // No limite o botão de adicionar dá lugar ao upgrade: conta quando aparece.
  useEffect(() => {
    if (!storesUsage?.isAtLimit || hasTrackedLimitRef.current) return;
    hasTrackedLimitRef.current = true;

    analytics.track('plan_limit_reached', {
      limit_type: 'stores',
      current: storesUsage.current,
      limit: storesUsage.limit,
      source: 'stores_page',
    });
  }, [storesUsage, analytics]);

  const handleAddStore = useCallback(() => {
    if (storesUsage?.isAtLimit) return;
    setIsAddModalOpen({ isOpen: true });
  }, [setIsAddModalOpen, storesUsage?.isAtLimit]);

  const handleRetry = useCallback(() => {
    void queryClient.refetchQueries({ queryKey: CACHE_QUERY_KEYS.stores() });
  }, [queryClient]);

  return {
    stores,
    isPendingStores,
    // Falha em refetch com lista em cache não deve esconder as lojas.
    hasLoadError: isError && stores.length === 0,
    isFetchingStores,
    storesUsage,
    handleAddStore,
    handleRetry,
  };
};
