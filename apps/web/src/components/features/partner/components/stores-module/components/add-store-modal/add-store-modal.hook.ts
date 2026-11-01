import { useStoresStore } from '@/store';
import { useIsMobile } from '@repo/ui';
import { useCallback } from 'react';

export const useAddStoreModal = () => {
  const isMobile = useIsMobile();
  const { store, isAddModalOpen, setIsAddModalOpen } = useStoresStore();
  const isEditingStore = !!store.id;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setIsAddModalOpen({ isOpen: false });
    },
    [setIsAddModalOpen],
  );

  return {
    isMobile,
    isOpen: isAddModalOpen,
    title: isEditingStore ? 'Configurações da loja' : 'Nova loja',
    description: isEditingStore
      ? store.name
      : 'Preencha as informações da nova loja.',
    handleOpenChange,
  };
};
