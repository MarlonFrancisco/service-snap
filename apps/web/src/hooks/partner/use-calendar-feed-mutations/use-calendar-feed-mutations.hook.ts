import { CalendarFeedService } from '@/service/calendar-feed';
import type {
  ICalendarFeed,
  TCalendarFeedTarget,
} from '@/types/api/calendar-feed.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCalendarFeedMutations = () => {
  const queryClient = useQueryClient();

  const setCachedFeed = (
    { storeId, memberId }: TCalendarFeedTarget,
    feed: ICalendarFeed | null,
  ) => {
    queryClient.setQueryData(
      CACHE_QUERY_KEYS.calendarFeed(storeId, memberId),
      feed,
    );
  };

  const { mutate: rotateFeed, isPending: isRotatePending } = useMutation({
    mutationFn: ({
      target,
    }: {
      target: TCalendarFeedTarget;
      hadLink: boolean;
    }) => CalendarFeedService.rotate(target),
    onSuccess: (feed, { target, hadLink }) => {
      setCachedFeed(target, feed);
      toast.success(
        hadLink
          ? 'Novo link gerado. O anterior parou de funcionar.'
          : 'Link da agenda gerado.',
      );
    },
    onError: () => {
      toast.error('Não foi possível gerar o link. Tente novamente.');
    },
  });

  const { mutate: revokeFeed, isPending: isRevokePending } = useMutation({
    mutationFn: (target: TCalendarFeedTarget) =>
      CalendarFeedService.revoke(target),
    onSuccess: (_, target) => {
      setCachedFeed(target, null);
      toast.success('Link desativado.');
    },
    onError: () => {
      toast.error('Não foi possível desativar o link. Tente novamente.');
    },
  });

  return { rotateFeed, isRotatePending, revokeFeed, isRevokePending };
};
