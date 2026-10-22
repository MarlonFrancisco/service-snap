import { StoreMembersService } from '@/service/store/store-members.service';
import { IProfessional } from '@/types/api';
import { IStore } from '@/types/api/stores.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useStoreMemberMutations = () => {
  const queryClient = useQueryClient();

  const updateStoreMembersCache = (
    storeId: string,
    updater: (members: IProfessional[]) => IProfessional[],
  ) => {
    queryClient.setQueryData(
      CACHE_QUERY_KEYS.storeMembers(storeId),
      (old: IProfessional[] = []) => updater(old),
    );

    // Agenda lê `activeStore.storeMembers` via useStoreQuery
    queryClient.setQueryData(
      CACHE_QUERY_KEYS.store(storeId),
      (old: IStore | undefined) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          storeMembers: updater(old.storeMembers || []),
        };
      },
    );
  };

  const updateStoreMemberMutation = useMutation({
    mutationFn: (data: {
      storeId: string;
      professional: Partial<IProfessional>;
    }) => StoreMembersService.update(data.storeId, data.professional),
    onSuccess: (data, variables) => {
      const storeId = data.store?.id || variables.storeId;
      updateStoreMembersCache(storeId, (members) =>
        members.map((m) => (m.id === data.id ? { ...m, ...data } : m)),
      );
      toast.success('Membro da loja atualizado com sucesso');
    },
  });

  const deleteStoreMemberMutation = useMutation({
    mutationFn: (data: { storeId: string; professionalId: string }) =>
      StoreMembersService.delete(data.storeId, data.professionalId),
    onSuccess: (data, variables) => {
      const storeId = data.store?.id || variables.storeId;
      updateStoreMembersCache(storeId, (members) =>
        members.filter((m) => m.id !== data.id),
      );
      toast.success('Membro da loja excluído com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir membro da loja');
    },
  });

  const createStoreMemberMutation = useMutation({
    mutationFn: (data: {
      storeId: string;
      professional: Partial<IProfessional>;
    }) => StoreMembersService.create(data.storeId, data.professional),
    onSuccess: (data, variables) => {
      const storeId = data.store?.id || variables.storeId;
      updateStoreMembersCache(storeId, (members) => [...members, data]);
      toast.success('Membro da loja adicionado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao adicionar membro da loja');
    },
  });

  return {
    updateStoreMemberMutation,
    deleteStoreMemberMutation,
    createStoreMemberMutation,
  };
};
