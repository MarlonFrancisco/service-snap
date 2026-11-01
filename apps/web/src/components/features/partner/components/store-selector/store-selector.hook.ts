'use client';

import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { usePartnerStore } from '@/store/partner';
import type { IStore } from '@/types/api/stores.types';
import { useCallback, useState } from 'react';

export const useStoreSelector = () => {
  const { stores } = useStoresQuery();
  const activeStore = usePartnerStore((state) => state.activeStore);
  const setActiveStore = usePartnerStore((state) => state.setActiveStore);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectStore = useCallback(
    (store: IStore) => {
      setActiveStore(store);
      setIsOpen(false);
    },
    [setActiveStore],
  );

  return {
    stores,
    activeStore,
    isOpen,
    setIsOpen,
    handleSelectStore,
  };
};
