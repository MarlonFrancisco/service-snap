import { WaitlistService } from '@/service/waitlist';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

/** Filas do cliente na loja. Exige login: passe `enabled` só com o usuário logado. */
export const useWaitlistQuery = ({
  storeId,
  enabled = true,
}: {
  storeId?: string;
  enabled?: boolean;
}) => {
  const { data: waitlistEntries, isPending: isPendingWaitlist } = useQuery({
    queryKey: CACHE_QUERY_KEYS.waitlist(storeId!),
    queryFn: () => WaitlistService.getByStore(storeId!),
    enabled: !!storeId && enabled,
  });

  return { waitlistEntries, isPendingWaitlist };
};

/** Filas do cliente em todas as lojas. Exige login. */
export const useMyWaitlistQuery = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const { data: myWaitlistEntries, isPending: isPendingMyWaitlist } = useQuery({
    queryKey: CACHE_QUERY_KEYS.myWaitlist(),
    queryFn: () => WaitlistService.getMine(),
    enabled,
  });

  return { myWaitlistEntries, isPendingMyWaitlist };
};
