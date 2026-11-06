import { useAnalytics } from '@/providers/analytics.provider';
import { GalleryService } from '@/service/store/gallery.service';
import { IStore, IStoreGallery } from '@/types/api/stores.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGalleryMutations = () => {
  const queryClient = useQueryClient();
  const analytics = useAnalytics();

  const updateMainImageMutation = useMutation({
    mutationFn: (data: { storeId: string; imageId: string }) =>
      GalleryService.update(data.storeId, data.imageId),
    onSuccess: (data, variables) => {
      analytics.track('store_image_main_set', { store_id: variables.storeId });
      queryClient.setQueryData(CACHE_QUERY_KEYS.stores(), (old: IStore[]) =>
        old.map((s) =>
          s.id === data.store?.id
            ? {
                ...s,
                gallery: s.gallery.map((g) =>
                  g.id === data.id
                    ? { ...g, isMain: true }
                    : { ...g, isMain: false },
                ),
              }
            : s,
        ),
      );
      toast.success('Imagem principal atualizada com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'store_image',
        operation: 'update',
      });
      toast.error('Erro ao atualizar imagem principal');
    },
  });

  const createImageMutation = useMutation({
    mutationFn: (data: { storeId: string; image: Omit<IStoreGallery, 'id'> }) =>
      GalleryService.create(data.storeId, data.image),
    onSuccess: (data, variables) => {
      analytics.track('store_image_uploaded', {
        store_id: variables.storeId,
        count: 1,
      });
      queryClient.setQueryData(CACHE_QUERY_KEYS.stores(), (old: IStore[]) =>
        old.map((s) =>
          s.id === data.store?.id
            ? {
                ...s,
                gallery: [...s.gallery, data],
              }
            : s,
        ),
      );
      toast.success('Imagem adicionada com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'store_image',
        operation: 'create',
      });
      toast.error('Erro ao adicionar imagem');
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (data: { storeId: string; imageId: string }) =>
      GalleryService.delete(data.storeId, data.imageId),
    onSuccess: (data, variables) => {
      analytics.track('store_image_deleted', { store_id: variables.storeId });
      queryClient.setQueryData(CACHE_QUERY_KEYS.stores(), (old: IStore[]) =>
        old.map((s) =>
          s.id === data.store.id
            ? {
                ...s,
                gallery: s.gallery.filter((g) => g.id !== data.id),
              }
            : s,
        ),
      );
      toast.success('Imagem excluída com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'store_image',
        operation: 'delete',
      });
      toast.error('Erro ao excluir imagem');
    },
  });

  return {
    updateMainImageMutation,
    createImageMutation,
    deleteImageMutation,
  };
};
