import { useServicesMutations } from '@/hooks';
import { usePartnerStore, useServicesStore } from '@/store';
import { IService } from '@/types/api/service.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { getCurrencySymbol } from '@repo/shared/formatters';
import { useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { TServiceFormData } from '../service-form.schema';

export const useServiceFormContent = () => {
  const categories = useServicesStore((state) => state.categories);
  const service = useServicesStore((state) => state.service);
  const setServiceModalParams = useServicesStore(
    (state) => state.setServiceModalParams,
  );
  const setCategoryModalParams = useServicesStore(
    (state) => state.setCategoryModalParams,
  );
  const activeStore = usePartnerStore((state) => state.activeStore);
  const queryClient = useQueryClient();

  const { updateService, createService, isCreatingService, isUpdatingService } =
    useServicesMutations({
      storeId: activeStore.id,
    });

  const form = useFormContext<TServiceFormData>();

  const isEditing = !!service.id;

  const handleClose = () => {
    setServiceModalParams({ isOpen: false });
  };

  const handleManageCategories = () => {
    handleClose();
    setCategoryModalParams({ isOpen: true });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(
      (data) => {
        if (isEditing) {
          const hasMovedCategory = data.category.id !== service.category?.id;

          updateService(data as IService, {
            onSuccess: () => {
              // O cache só atualiza o serviço dentro da categoria de destino,
              // onde ele ainda não está: a categoria de origem ficaria defasada.
              if (hasMovedCategory) {
                void queryClient.invalidateQueries({
                  queryKey: CACHE_QUERY_KEYS.categories(activeStore.id),
                });
              }
              handleClose();
            },
          });
        } else {
          createService(
            {
              ...data,
              id: undefined,
            } as Partial<IService>,
            {
              onSuccess: () => {
                handleClose();
              },
            },
          );
        }
      },
      (errors) => {
        const firstError = Object.values(errors)[0]?.message;
        if (firstError) {
          toast.error(firstError);
        }
      },
    )(event);
  };

  return {
    categories,
    form,
    isEditing,
    isSaving: isCreatingService || isUpdatingService,
    currencySymbol: getCurrencySymbol(activeStore.currency),
    handleClose,
    handleManageCategories,
    handleSubmit,
  };
};
