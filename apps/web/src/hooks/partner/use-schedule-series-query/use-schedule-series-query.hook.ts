import { isApiHttpError } from '@/service/api';
import { ScheduleSeriesService } from '@/service/partner/schedule-series';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import type { TUseScheduleSeriesQueryConfig } from './use-schedule-series-query.types';

const NO_RETRY_STATUS = [400, 401, 403, 404];

export const useScheduleSeriesQuery = ({
  storeId,
  seriesId,
  enabled = true,
}: TUseScheduleSeriesQueryConfig) => {
  const canFetch = enabled && !!storeId && !!seriesId;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.scheduleSeries(storeId!, seriesId!),
    queryFn: () => ScheduleSeriesService.get(storeId!, seriesId!),
    enabled: canFetch,
    // A série muda a cada cancelamento: confere de novo ao abrir
    staleTime: 0,
    retry: (failureCount, error) =>
      !(isApiHttpError(error) && NO_RETRY_STATUS.includes(error.status)) &&
      failureCount < 2,
  });

  return {
    series: data,
    isLoadingSeries: canFetch && isPending,
    isSeriesError: canFetch && isError,
    refetchSeries: refetch,
  };
};
