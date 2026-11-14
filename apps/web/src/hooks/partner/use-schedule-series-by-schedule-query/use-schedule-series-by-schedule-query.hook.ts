import { ScheduleSeriesService } from '@/service/partner/schedule-series';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import type { TUseScheduleSeriesByScheduleQueryConfig } from './use-schedule-series-by-schedule-query.types';

/** A série do agendamento aberto, para o cancelamento oferecer "e os próximos". */
export const useScheduleSeriesByScheduleQuery = ({
  storeId,
  scheduleId,
  enabled = true,
}: TUseScheduleSeriesByScheduleQueryConfig) => {
  const canFetch = enabled && !!storeId && !!scheduleId;

  const { data, isPending } = useQuery({
    queryKey: CACHE_QUERY_KEYS.scheduleSeriesBySchedule(storeId!, scheduleId!),
    queryFn: () => ScheduleSeriesService.getBySchedule(storeId!, scheduleId!),
    enabled: canFetch,
  });

  return {
    seriesMembership: data?.series ?? null,
    isLoadingSeriesMembership: canFetch && isPending,
  };
};
