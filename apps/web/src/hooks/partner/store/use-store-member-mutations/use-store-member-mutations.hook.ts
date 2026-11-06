import { useAnalytics } from '@/providers/analytics.provider';
import { isApiHttpError } from '@/service/api';
import { StoreMembersService } from '@/service/store/store-members.service';
import { IProfessional } from '@/types/api';
import { IStore } from '@/types/api/stores.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useStoreMemberMutations = () => {
  const queryClient = useQueryClient();
  const analytics = useAnalytics();

  const invalidateCurrentPlan = () => {
    void queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.currentPlan(),
    });
  };

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
      analytics.track('team_member_updated', {
        store_id: storeId,
        is_active: data.isActive,
      });
      toast.success('Membro da loja atualizado com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'team_member',
        operation: 'update',
      });
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
      invalidateCurrentPlan();
      analytics.track('team_member_removed', { store_id: storeId });
      toast.success('Membro da loja excluído com sucesso');
    },
    onError: (error: unknown) => {
      analytics.track('partner_mutation_failed', {
        entity: 'team_member',
        operation: 'delete',
      });
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao excluir membro da loja';
      toast.error(message);
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
      invalidateCurrentPlan();
      analytics.track('team_member_invited', {
        store_id: storeId,
        role: data.role,
      });
      toast.success('Membro da loja adicionado com sucesso');
    },
    onError: (error: unknown, variables) => {
      analytics.track('team_member_invite_failed', {
        store_id: variables.storeId,
        http_status: isApiHttpError(error) ? error.status : undefined,
      });
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao adicionar membro da loja';
      toast.error(message);
    },
  });

  return {
    updateStoreMemberMutation,
    deleteStoreMemberMutation,
    createStoreMemberMutation,
  };
};
