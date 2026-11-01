import { useStoreMutations } from '@/hooks/partner/store/use-store-mutations/use-store-mutations.hook';
import { useStoresStore } from '@/store/admin/stores';
import type { IStore } from '@/types/api/stores.types';
import { orderGalleryByMainImage } from '@/utils/helpers/gallery.helper';
import { useCallback, useMemo } from 'react';
import {
  getStoreHoursLabel,
  getStoreLocationLabel,
} from '../../utils/stores-module.helpers';
import { useRefreshCurrentPlan } from '../../utils/use-refresh-current-plan.hook';

export const useStoreCard = (store: IStore) => {
  const { setIsAddModalOpen, setViewDetailsStore } = useStoresStore();
  const { updateStoreMutation, deleteStoreMutation } = useStoreMutations();
  const refreshCurrentPlan = useRefreshCurrentPlan();

  const orderedGallery = useMemo(
    () => orderGalleryByMainImage(store.gallery || []),
    [store.gallery],
  );

  const handleEditStore = useCallback(() => {
    setIsAddModalOpen({ isOpen: true, store });
  }, [setIsAddModalOpen, store]);

  const handleToggleStatus = useCallback(() => {
    updateStoreMutation.mutate(
      { id: store.id, isActive: !store.isActive },
      { onSuccess: refreshCurrentPlan },
    );
  }, [updateStoreMutation, store, refreshCurrentPlan]);

  const handleDeleteStore = useCallback(() => {
    // `mutateAsync`: o cartão desmonta ao sair do cache, e o callback de `mutate`
    // não dispararia. O erro já vira toast dentro da mutação.
    void deleteStoreMutation
      .mutateAsync(store.id)
      .then(refreshCurrentPlan)
      .catch(() => undefined);
  }, [deleteStoreMutation, store.id, refreshCurrentPlan]);

  const handleViewDetails = useCallback(() => {
    setViewDetailsStore({ isOpen: true, store });
  }, [setViewDetailsStore, store]);

  return {
    isLoading: updateStoreMutation.isPending || deleteStoreMutation.isPending,
    orderedGallery,
    hoursLabel: getStoreHoursLabel(store),
    locationLabel: getStoreLocationLabel(store),
    handleEditStore,
    handleToggleStatus,
    handleDeleteStore,
    handleViewDetails,
  };
};
