import { useCategoryMutations } from '@/hooks/partner/use-category-mutations/use-category-mutations.hook';
import { usePartnerStore, useServicesStore } from '@/store';
import { INITIAL_CATEGORY } from '@/store/admin/services/services.constants';
import { ICategory } from '@/types/api/service.types';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DEFAULT_CATEGORY_COLOR, isCategoryColor } from '../../utils/colors';
import { categoryFormSchema, TCategoryFormData } from './category.schema';

export type TCategoryTab = 'list' | 'form';

const toCategoryFormValues = (category: ICategory): TCategoryFormData => ({
  id: category.id,
  name: category.name ?? '',
  description: category.description ?? '',
  color: isCategoryColor(category.color)
    ? category.color
    : DEFAULT_CATEGORY_COLOR,
});

export const useCategoryManagement = () => {
  const isCategoryModalOpen = useServicesStore(
    (state) => state.isCategoryModalOpen,
  );
  const category = useServicesStore((state) => state.category);
  const hasCategories = useServicesStore(
    (state) => state.categories.length > 0,
  );
  const setCategoryModalParams = useServicesStore(
    (state) => state.setCategoryModalParams,
  );
  const activeStore = usePartnerStore((state) => state.activeStore);
  const [tab, setTab] = useState<TCategoryTab>('list');

  const { updateCategoryMutation, createCategoryMutation } =
    useCategoryMutations({
      storeId: activeStore.id,
    });

  const form = useForm<TCategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: toCategoryFormValues(INITIAL_CATEGORY),
  });

  useEffect(() => {
    if (isCategoryModalOpen) {
      form.reset(toCategoryFormValues(category));
    }
  }, [category, isCategoryModalOpen, form]);

  useEffect(() => {
    if (isCategoryModalOpen) {
      setTab(hasCategories ? 'list' : 'form');
    }
  }, [isCategoryModalOpen, hasCategories]);

  const isEditing = !!category.id;

  const handleClose = () => {
    setCategoryModalParams({ isOpen: false });
  };

  const handleBackToList = () => {
    setCategoryModalParams({ isOpen: true });
    form.reset(toCategoryFormValues(INITIAL_CATEGORY));
    setTab('list');
  };

  const handleEdit = (categoryToEdit: ICategory) => {
    setCategoryModalParams({ isOpen: true, category: categoryToEdit });
    setTab('form');
  };

  const handleTabChange = (value: string) => {
    if (value === 'list') {
      handleBackToList();
      return;
    }

    setTab('form');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(
      (data) => {
        if (isEditing) {
          updateCategoryMutation.mutate(data, {
            onSuccess: handleBackToList,
          });
        } else {
          createCategoryMutation.mutate(
            { ...data, id: undefined },
            { onSuccess: handleBackToList },
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
    isCategoryModalOpen,
    isEditing,
    form,
    tab,
    isSaving:
      createCategoryMutation.isPending || updateCategoryMutation.isPending,
    handleClose,
    handleBackToList,
    handleEdit,
    handleTabChange,
    handleSubmit,
  };
};
