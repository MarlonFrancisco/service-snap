import { useStoreMutations } from '@/hooks/partner/store/use-store-mutations/use-store-mutations.hook';
import { useStoresStore } from '@/store';
import { useCallback } from 'react';
import {
  getStoreHoursLabel,
  getStoreLocationLabel,
} from '../../utils/stores-module.helpers';
import { useRefreshCurrentPlan } from '../../utils/use-refresh-current-plan.hook';

export const useStoreDetailsDrawer = () => {
  const {
    store,
    isViewDetailsStoreOpen,
    setViewDetailsStore,
    setIsAddModalOpen,
  } = useStoresStore();
  const { deleteStoreMutation } = useStoreMutations();
  const refreshCurrentPlan = useRefreshCurrentPlan();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setViewDetailsStore({ isOpen: false });
    },
    [setViewDetailsStore],
  );

  const handleManage = useCallback(() => {
    setViewDetailsStore({ isOpen: false });
    setIsAddModalOpen({ isOpen: true, store });
  }, [setViewDetailsStore, setIsAddModalOpen, store]);

  const handleDelete = useCallback(() => {
    void deleteStoreMutation
      .mutateAsync(store.id)
      .then(() => {
        setViewDetailsStore({ isOpen: false });
        refreshCurrentPlan();
      })
      .catch(() => undefined);
  }, [deleteStoreMutation, store.id, setViewDetailsStore, refreshCurrentPlan]);

  return {
    store,
    isOpen: isViewDetailsStoreOpen,
    isDeleting: deleteStoreMutation.isPending,
    hoursLabel: getStoreHoursLabel(store),
    locationLabel: getStoreLocationLabel(store),
    handleOpenChange,
    handleManage,
    handleDelete,
  };
};
