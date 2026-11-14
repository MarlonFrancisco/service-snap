import { isApiHttpError } from '@/service/api';
import { CalendarFeedService } from '@/service/calendar-feed';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

/** 403 (agenda de outro profissional) não muda com nova tentativa. */
const retryTransientFailureOnce = (failureCount: number, error: unknown) => {
  if (isApiHttpError(error) && error.status < 500) return false;
  return failureCount < 1;
};

export const useCalendarFeedQuery = ({
  storeId,
  memberId,
}: {
  storeId: string;
  memberId: string;
}) => {
  const canFetch = Boolean(storeId && memberId);

  const {
    data: calendarFeed,
    isPending,
    isError: isCalendarFeedError,
    error: calendarFeedError,
    isFetching: isCalendarFeedFetching,
    refetch: refetchCalendarFeed,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.calendarFeed(storeId, memberId),
    queryFn: () => CalendarFeedService.get({ storeId, memberId }),
    enabled: canFetch,
    retry: retryTransientFailureOnce,
  });

  return {
    calendarFeed,
    isCalendarFeedPending: canFetch && isPending,
    isCalendarFeedError,
    calendarFeedError,
    isCalendarFeedFetching,
    refetchCalendarFeed,
  };
};
