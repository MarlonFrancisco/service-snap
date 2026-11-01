import { useStoresStore } from '@/store/admin/stores';
import { Store } from 'lucide-react';
import { StatePanel } from '../state-panel';

export const EmptyStoreList = () => {
  const { setIsAddModalOpen } = useStoresStore();

  return (
    <StatePanel
      icon={Store}
      title="Nenhuma loja cadastrada"
      description="Você ainda não cadastrou nenhuma loja. Adicione a primeira para começar a receber agendamentos."
      actionLabel="Adicionar nova loja"
      onAction={() => setIsAddModalOpen({ isOpen: true })}
    />
  );
};
