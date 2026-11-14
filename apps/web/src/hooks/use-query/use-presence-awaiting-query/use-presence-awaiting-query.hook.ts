import { ScheduleService } from '@/service/partner/schedule';
import type { IPresenceAwaiting } from '@/types/api/schedule.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

/** Referência estável: um `[]` novo a cada render refaria tudo que depende da lista. */
const EMPTY_PRESENCE_AWAITING: IPresenceAwaiting[] = [];

export const usePresenceAwaitingQuery = ({
  storeId,
  enabled = true,
}: {
  storeId?: string;
  enabled?: boolean;
}) => {
  const canFetch = enabled && !!storeId;

  const { data: presenceAwaiting = EMPTY_PRESENCE_AWAITING, isError } =
    useQuery({
      queryKey: CACHE_QUERY_KEYS.presenceAwaiting(storeId!),
      queryFn: () => ScheduleService.getPresenceAwaiting(storeId!),
      enabled: canFetch,
    });

  return {
    presenceAwaiting,
    isPresenceAwaitingError: canFetch && isError,
  };
};
