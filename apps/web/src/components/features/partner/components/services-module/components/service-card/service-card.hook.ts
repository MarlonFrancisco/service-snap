import { useServicesMutations } from '@/hooks/partner/use-services-mutations/use-services-mutations.hook';
import { usePartnerStore, useServicesStore } from '@/store';
import { IService } from '@/types/api/service.types';
import { formatStorePrice } from '@repo/shared/formatters';
import { useState } from 'react';

export const useServiceCard = ({ service }: { service: IService }) => {
  const setServiceModalParams = useServicesStore(
    (state) => state.setServiceModalParams,
  );
  const activeStore = usePartnerStore((state) => state.activeStore);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    deleteService,
    isDeletingService,
    updateService,
    isUpdatingService,
  } = useServicesMutations({
    storeId: activeStore.id,
  });

  const priceLabel = formatStorePrice(
    service.price,
    activeStore.currency,
    activeStore.country,
  );

  const handleEdit = () => {
    setServiceModalParams({ isOpen: true, service });
  };

  const handleRequestDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteService(service, {
      onSuccess: () => setIsDeleteDialogOpen(false),
    });
  };

  const handleToggleStatus = () => {
    updateService({ ...service, isActive: !service.isActive });
  };

  return {
    priceLabel,
    durationLabel: `${service.duration} min`,
    isDeleteDialogOpen,
    isDeletingService,
    isUpdatingService,
    setIsDeleteDialogOpen,
    handleEdit,
    handleRequestDelete,
    handleConfirmDelete,
    handleToggleStatus,
  };
};
