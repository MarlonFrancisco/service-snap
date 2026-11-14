import { isApiHttpError } from '@/service/api';
import { WaitlistService } from '@/service/waitlist';
import type {
  IJoinWaitlistPayload,
  IWaitlistEntry,
} from '@/types/api/waitlist.types';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type TJoinWaitlistVariables = IJoinWaitlistPayload & { storeId: string };
type TLeaveWaitlistVariables = { storeId: string; entryId: string };

/** Prefixo comum a todas as consultas de horários da loja. */
const getAvailabilityPrefix = (storeId: string) =>
  CACHE_QUERY_KEYS.availability(storeId, { date: '', serviceIds: [] }).slice(
    0,
    1,
  );

/**
 * Só cuida do cache. As mensagens de erro ao entrar dependem da tela (o dia,
 * os serviços escolhidos), então ficam com quem chama.
 */
export const useWaitlistMutations = () => {
  const queryClient = getQueryClient();

  const { mutate: joinWaitlist, isPending: isJoiningWaitlist } = useMutation({
    mutationFn: ({ storeId, ...payload }: TJoinWaitlistVariables) =>
      WaitlistService.join(storeId, payload),
    onSuccess: (entry, { storeId }) => {
      queryClient.setQueryData<IWaitlistEntry[]>(
        CACHE_QUERY_KEYS.waitlist(storeId),
        (old = []) => [...old.filter(({ id }) => id !== entry.id), entry],
      );
      // Uma leitura iniciada antes da entrada (logo após o login) não a traria
      queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.waitlist(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.myWaitlist(),
      });
    },
    onError: (error, { storeId }) => {
      // 409: vagou um horário no dia, os horários na tela estão velhos
      if (isApiHttpError(error) && error.status === 409) {
        queryClient.invalidateQueries({
          queryKey: getAvailabilityPrefix(storeId),
        });
      }
    },
  });

  const { mutate: leaveWaitlist, isPending: isLeavingWaitlist } = useMutation({
    mutationFn: ({ storeId, entryId }: TLeaveWaitlistVariables) =>
      WaitlistService.leave(storeId, entryId),
    onSuccess: (_, { storeId, entryId }) => {
      const removeEntry = (old?: IWaitlistEntry[]) =>
        old?.filter(({ id }) => id !== entryId);

      queryClient.setQueryData(CACHE_QUERY_KEYS.waitlist(storeId), removeEntry);
      queryClient.setQueryData(CACHE_QUERY_KEYS.myWaitlist(), removeEntry);
      toast.success('Você saiu da lista de espera');
    },
    onError: () => {
      toast.error('Não foi possível sair da lista de espera. Tente novamente.');
    },
  });

  return {
    joinWaitlist,
    isJoiningWaitlist,
    leaveWaitlist,
    isLeavingWaitlist,
  };
};
