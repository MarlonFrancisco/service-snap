import { useCategoryMutations } from '@/hooks/partner/use-category-mutations/use-category-mutations.hook';
import { usePartnerStore, useServicesStore } from '@/store';
import { ICategory } from '@/types/api/service.types';
import { useState } from 'react';
import { formatServiceCount } from '../../../utils/services-sections';

const getDeleteDialogContent = (category: ICategory | null) => {
  const name = category?.name ?? '';
  const serviceCount = category?.services.length ?? 0;

  if (serviceCount > 0) {
    const servicesLabel = serviceCount === 1 ? 'esse serviço' : 'esses serviços';

    return {
      title: `Não é possível excluir a categoria ${name}`,
      description: `Ela ainda tem ${formatServiceCount(serviceCount)}. Mova ou exclua ${servicesLabel} e tente de novo.`,
      cancelLabel: 'Entendi',
      confirmLabel: undefined,
    };
  }

  return {
    title: `Excluir a categoria ${name}?`,
    description:
      'Ela sai da lista de categorias da loja. Esta ação não pode ser desfeita.',
    cancelLabel: 'Manter categoria',
    confirmLabel: 'Excluir categoria',
  };
};

export const useCategoryList = () => {
  const categories = useServicesStore((state) => state.categories);
  const activeStore = usePartnerStore((state) => state.activeStore);
  const { deleteCategoryMutation } = useCategoryMutations({
    storeId: activeStore.id,
  });

  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleRequestDelete = (category: ICategory) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;

    deleteCategoryMutation.mutate(categoryToDelete.id, {
      onSuccess: () => setIsDeleteDialogOpen(false),
    });
  };

  return {
    categories,
    deleteDialog: getDeleteDialogContent(categoryToDelete),
    isDeleteDialogOpen,
    isDeletingCategory: deleteCategoryMutation.isPending,
    setIsDeleteDialogOpen,
    handleRequestDelete,
    handleConfirmDelete,
  };
};
