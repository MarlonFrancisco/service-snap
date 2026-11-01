import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { useMemo } from 'react';

export const useStatsCards = () => {
  const { stores } = useStoresQuery();

  const activeStores = useMemo(
    () => stores.filter((store) => store.isActive).length,
    [stores],
  );

  return { totalStores: stores.length, activeStores };
};
