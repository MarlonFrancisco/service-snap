import { useAnalytics } from '@/providers/analytics.provider';
import { ServiceService } from '@/service/partner/service/service.service';
import { ICategory, IService } from '@/types/api/service.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useServicesMutations = ({ storeId }: { storeId: string }) => {
  const queryClient = useQueryClient();
  const analytics = useAnalytics();

  const { mutate: createService, isPending: isCreatingService } = useMutation({
    mutationFn: (service: Partial<IService>) =>
      ServiceService.create(storeId, service),
    onSuccess: (data) => {
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.categories(storeId),
        (old: ICategory[]) =>
          old.map((c) =>
            c.id === data.category?.id
              ? { ...c, services: [...c.services, data] }
              : c,
          ),
      );
      analytics.track('service_created', {
        service_id: data.id,
        price: data.price,
        duration: data.duration,
      });
      toast.success('Serviço criado com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'service',
        operation: 'create',
      });
      toast.error('Erro ao criar serviço');
    },
  });

  const { mutate: updateService, isPending: isUpdatingService } = useMutation({
    mutationFn: (service: IService) => ServiceService.update(storeId, service),
    onSuccess: (data) => {
      const previousCategoryId = queryClient
        .getQueryData<ICategory[]>(CACHE_QUERY_KEYS.categories(storeId))
        ?.find((c) => c.services.some((s) => s.id === data.id))?.id;

      analytics.track('service_updated', {
        service_id: data.id,
        category_changed:
          previousCategoryId !== undefined &&
          previousCategoryId !== data.category?.id,
      });

      queryClient.setQueryData(
        CACHE_QUERY_KEYS.categories(storeId),
        (old: ICategory[]) =>
          old.map((c) =>
            c.id === data.category?.id
              ? {
                  ...c,
                  services: c.services.map((s) =>
                    s.id === data.id ? { ...s, ...data } : s,
                  ),
                }
              : c,
          ),
      );
      toast.success('Serviço atualizado com sucesso');
    },
    onError: (error) => {
      console.error(error);
      analytics.track('partner_mutation_failed', {
        entity: 'service',
        operation: 'update',
      });
      toast.error('Erro ao atualizar serviço');
    },
  });

  const { mutate: deleteService, isPending: isDeletingService } = useMutation({
    mutationFn: (service: IService) =>
      ServiceService.delete(storeId, service.category!.id!, service.id),
    onSuccess: (data) => {
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.categories(storeId),
        (old: ICategory[]) =>
          old.map((c) =>
            c.id === data.category?.id
              ? { ...c, services: c.services.filter((s) => s.id !== data.id) }
              : c,
          ),
      );
      analytics.track('service_deleted', { service_id: data.id });
      toast.success('Serviço excluído com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'service',
        operation: 'delete',
      });
      toast.error('Erro ao excluir serviço');
    },
  });

  return {
    createService,
    isCreatingService,
    updateService,
    isUpdatingService,
    deleteService,
    isDeletingService,
  };
};
