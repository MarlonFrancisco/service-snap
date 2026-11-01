import { useStoreMutations } from '@/hooks/partner/store/use-store-mutations/use-store-mutations.hook';
import { useStoresStore } from '@/store/admin/stores';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { toast } from 'sonner';
import { useRefreshCurrentPlan } from '../../../utils/use-refresh-current-plan.hook';
import { STORE_FORM_TABS } from './store-form-tabs.constants';
import { getTabsWithErrors, toStoreFormValues } from './store-form-tabs.helpers';
import type { TStoreFormTab } from './store-form-tabs.types';
import { storeFormSchema, type TStoreFormSchema } from './store-form.schema';

export const useStoreFormTabs = () => {
  const { store, setIsAddModalOpen } = useStoresStore();
  const { updateStoreMutation, createStoreMutation } = useStoreMutations();
  const refreshCurrentPlan = useRefreshCurrentPlan();
  const [activeTab, setActiveTab] = useState<TStoreFormTab>('basic');

  const isEditingStore = !!store.id;

  const form = useForm<TStoreFormSchema>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: toStoreFormValues(store),
  });

  const tabsWithErrors = getTabsWithErrors(form.formState.errors);

  useEffect(() => {
    if (isEditingStore) {
      form.reset(toStoreFormValues(store));
    }
  }, [store, form, isEditingStore]);

  const handleInvalid = useCallback(
    (errors: FieldErrors<TStoreFormSchema>) => {
      const invalidTabs = getTabsWithErrors(errors);
      const targetTab =
        invalidTabs.find((tab) => tab.value === activeTab) ?? invalidTabs[0];

      if (!targetTab) {
        toast.error('Revise os dados da loja');
        return;
      }

      const firstField = targetTab.fields.find((field) => errors[field]);

      setActiveTab(targetTab.value);
      toast.error(`Revise a aba ${targetTab.label}`, {
        description: firstField ? errors[firstField]?.message : undefined,
      });

      // O painel da aba só monta depois da troca; antes disso não há campo.
      requestAnimationFrame(() => {
        if (firstField) form.setFocus(firstField);
      });
    },
    [activeTab, form],
  );

  const handleSubmit = useCallback(() => {
    form.handleSubmit((data) => {
      const fn = isEditingStore
        ? updateStoreMutation.mutate
        : createStoreMutation.mutate;
      const normalizeData = Object.fromEntries(
        Object.entries(data).filter(
          ([key, value]) =>
            value !== '' && !['gallery', 'storeMembers'].includes(key),
        ),
      );

      fn(normalizeData, {
        onSuccess: () => {
          setIsAddModalOpen({ isOpen: false });
          refreshCurrentPlan();
        },
      });
    }, handleInvalid)();
  }, [
    form,
    isEditingStore,
    updateStoreMutation,
    createStoreMutation,
    setIsAddModalOpen,
    refreshCurrentPlan,
    handleInvalid,
  ]);

  const handleClose = useCallback(() => {
    setIsAddModalOpen({ isOpen: false });
  }, [setIsAddModalOpen]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TStoreFormTab);
  }, []);

  return {
    form,
    tabs: STORE_FORM_TABS.map((tab) => ({
      ...tab,
      isDisabled: tab.requiresSavedStore && !isEditingStore,
      hasError: tabsWithErrors.includes(tab),
    })),
    invalidTabsLabel: tabsWithErrors.map((tab) => tab.label).join(', '),
    activeTab,
    isEditingStore,
    isLoading: updateStoreMutation.isPending || createStoreMutation.isPending,
    handleTabChange,
    handleSubmit,
    handleClose,
  };
};
