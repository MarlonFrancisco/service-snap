import { BlockedTimesService } from '@/service/partner/blocked-times/blocked-times.service';
import { IBlockedTime } from '@/types/api/blocked-times.types';
import { IStore } from '@/types/api/stores.types';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useBlockedTimeMutations = ({ storeId }: { storeId: string }) => {
  const queryClient = getQueryClient();
  const { mutate: createBlockedTime, isPending: isCreatingBlockedTime } =
    useMutation({
      mutationFn: (blockedTime: Partial<IBlockedTime>) =>
        BlockedTimesService.create(storeId, blockedTime),
      onSuccess: (data: IBlockedTime) => {
        queryClient.setQueryData(
          CACHE_QUERY_KEYS.store(storeId),
          (old: IStore) => ({
            ...old,
            storeMembers: (old?.storeMembers || []).map((storeMember) =>
              storeMember.id === data.storeMember.id
                ? {
                    ...storeMember,
                    blockedTimes: [...(storeMember.blockedTimes || []), data],
                  }
                : storeMember,
            ),
          }),
        );

        toast.success('Horário bloqueado criado com sucesso');
      },
      onError: () => {
        toast.error('Erro ao criar horário bloqueado');
      },
    });

  const { mutate: deleteBlockedTime, isPending: isDeletingBlockedTime } =
    useMutation({
      mutationFn: (blockedTime: IBlockedTime) =>
        BlockedTimesService.delete(
          storeId,
          blockedTime.storeMember.id,
          blockedTime.id,
        ),
      onSuccess: (data: IBlockedTime) => {
        queryClient.setQueryData(
          CACHE_QUERY_KEYS.store(storeId),
          (old: IStore) => ({
            ...old,
            storeMembers: (old?.storeMembers || []).map((storeMember) =>
              storeMember.id === data.storeMember.id
                ? {
                    ...storeMember,
                    blockedTimes: (storeMember.blockedTimes || []).filter(
                      (blockedTime) => blockedTime.id !== data.id,
                    ),
                  }
                : storeMember,
            ),
          }),
        );
        toast.success('Horário bloqueado deletado com sucesso');
      },
      onError: () => {
        toast.error('Erro ao deletar horário bloqueado');
      },
    });

  const {
    mutate: createBulkBlockedTime,
    isPending: isCreatingBulkBlockedTime,
  } = useMutation({
    mutationFn: ({
      storeMemberId,
      blockedTimes,
    }: {
      storeMemberId: string;
      blockedTimes: Array<{
        date: Date | string;
        time: string;
        isRecurring?: boolean;
        dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      }>;
    }) => BlockedTimesService.createBulk(storeId, storeMemberId, blockedTimes),
    onSuccess: (data: IBlockedTime[]) => {
      if (data.length === 0) return;

      queryClient.setQueryData(
        CACHE_QUERY_KEYS.store(storeId),
        (old: IStore) => ({
          ...old,
          storeMembers: (old?.storeMembers || []).map((storeMember) =>
            storeMember.id === data[0]!.storeMember.id
              ? {
                  ...storeMember,
                  blockedTimes: [...(storeMember.blockedTimes || []), ...data],
                }
              : storeMember,
          ),
        }),
      );

      toast.success(
        `${data.length} ${data.length === 1 ? 'horário bloqueado' : 'horários bloqueados'} ${data.length === 1 ? 'criado' : 'criados'} com sucesso`,
      );
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao criar horários bloqueados');
    },
  });

  const {
    mutate: deleteBulkBlockedTime,
    isPending: isDeletingBulkBlockedTime,
  } = useMutation({
    mutationFn: ({
      storeMemberId,
      blockedTimes,
    }: {
      storeMemberId: string;
      blockedTimes: Array<{
        id: string;
      }>;
    }) => BlockedTimesService.deleteBulk(storeId, storeMemberId, blockedTimes),
    onSuccess: (data: { id: string; storeMember: { id: string } }[]) => {
      if (data.length === 0) return;

      queryClient.setQueryData(
        CACHE_QUERY_KEYS.store(storeId),
        (old: IStore) => ({
          ...old,
          storeMembers: (old?.storeMembers || []).map((storeMember) =>
            storeMember.id === data[0]!.storeMember.id
              ? {
                  ...storeMember,
                  blockedTimes: (storeMember.blockedTimes || []).filter(
                    (blockedTime) =>
                      !data.some((bt) => bt.id === blockedTime.id),
                  ),
                }
              : storeMember,
          ),
        }),
      );

      toast.success(
        `${data.length} ${data.length === 1 ? 'horário desbloqueado' : 'horários desbloqueados'} ${data.length === 1 ? 'desbloqueado' : 'desbloqueados'} com sucesso`,
      );
    },
    onError: () => {
      toast.error('Erro ao desbloquear horários');
    },
  });

  return {
    createBlockedTime,
    createBulkBlockedTime,
    deleteBulkBlockedTime,
    deleteBlockedTime,
    isCreatingBlockedTime,
    isCreatingBulkBlockedTime,
    isDeletingBlockedTime,
    isDeletingBulkBlockedTime,
  };
};
