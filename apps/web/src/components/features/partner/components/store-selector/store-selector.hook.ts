'use client';

import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { useAnalytics } from '@/providers/analytics.provider';
import { usePartnerStore } from '@/store/partner';
import type { IStore } from '@/types/api/stores.types';
import { useCallback, useState } from 'react';

export const useStoreSelector = () => {
  const analytics = useAnalytics();
  const { stores } = useStoresQuery();
  const activeStore = usePartnerStore((state) => state.activeStore);
  const setActiveStore = usePartnerStore((state) => state.setActiveStore);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectStore = useCallback(
    (store: IStore) => {
      if (store.id !== activeStore.id) {
        analytics.track('active_store_switched', {
          store_id: store.id,
          stores_count: stores?.length ?? 0,
        });
      }

      setActiveStore(store);
      setIsOpen(false);
    },
    [analytics, activeStore.id, stores, setActiveStore],
  );

  return {
    stores,
    activeStore,
    isOpen,
    setIsOpen,
    handleSelectStore,
  };
};
