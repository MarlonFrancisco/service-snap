import { ScheduleService } from '@/service/partner/schedule';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

export const useSchedulesQuery = ({
  storeId,
  enabled = true,
}: {
  storeId?: string;
  enabled?: boolean;
}) => {
  const canFetch = enabled && !!storeId;

  const {
    data: schedules = [],
    isPending: isPendingSchedules,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.schedulesAvailability(storeId!),
    queryFn: () => ScheduleService.getAvailability(storeId!),
    enabled: canFetch,
  });

  return {
    schedules,
    isPendingSchedules: canFetch && isPendingSchedules,
    isFetching,
    isError: canFetch && isError,
    refetch,
  };
};
