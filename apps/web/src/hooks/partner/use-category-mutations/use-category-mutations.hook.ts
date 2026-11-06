import { useAnalytics } from '@/providers/analytics.provider';
import { CategoryService } from '@/service/partner/category/category.service';
import { ICategory } from '@/types/api/service.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TUseCategoryConfig } from './use-category-mutations.types';

export const useCategoryMutations = ({ storeId }: TUseCategoryConfig) => {
  const queryClient = useQueryClient();
  const analytics = useAnalytics();

  const createCategoryMutation = useMutation({
    mutationFn: (category: Partial<ICategory>) =>
      CategoryService.create(storeId, category),
    onSuccess: (data) => {
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.categories(storeId),
        (old: ICategory[]) => [...old, { ...data, services: [] }],
      );
      analytics.track('category_created', { category_id: data.id });
      toast.success('Categoria criada com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'category',
        operation: 'create',
      });
      toast.error('Erro ao criar categoria');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (category: Partial<ICategory>) =>
      CategoryService.update(storeId, category),
    onSuccess: (data) => {
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.categories(storeId),
        (old: ICategory[]) =>
          old.map((c) => (c.id === data.id ? { ...c, ...data } : c)),
      );
      analytics.track('category_updated', { category_id: data.id });
      toast.success('Categoria atualizada com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'category',
        operation: 'update',
      });
      toast.error('Erro ao atualizar categoria');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) =>
      CategoryService.delete(storeId, categoryId),
    onSuccess: (data) => {
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.categories(storeId),
        (old: ICategory[]) => old.filter((c) => c.id !== data.id),
      );
      analytics.track('category_deleted', { category_id: data.id });
      toast.success('Categoria excluída com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'category',
        operation: 'delete',
      });
      toast.error('Erro ao excluir categoria');
    },
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
};
