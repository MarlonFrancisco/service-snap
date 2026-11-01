import { ScheduleService } from '@/service/partner/schedule';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

export const useAvailabilityQuery = ({
  storeId,
  date,
  serviceIds,
  memberId,
}: {
  storeId?: string;
  date?: string;
  serviceIds: string[];
  memberId?: string;
}) => {
  const params = { date: date!, serviceIds, memberId };

  const {
    data: slots,
    isLoading: isLoadingSlots,
    isError: isSlotsError,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.availability(storeId!, params),
    queryFn: ({ signal }) =>
      ScheduleService.getAvailability(storeId!, params, { signal }),
    enabled: !!storeId && !!date && serviceIds.length > 0,
    // Horários mudam a cada reserva: sempre confere de novo ao abrir a etapa
    staleTime: 0,
  });

  return { slots, isLoadingSlots, isSlotsError };
};
