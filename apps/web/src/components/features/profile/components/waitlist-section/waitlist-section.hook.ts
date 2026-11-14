import { useWaitlistMutations } from '@/hooks/use-mutations/use-waitlist-mutations';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useMyWaitlistQuery } from '@/hooks/use-query/use-waitlist-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useCallback, useMemo, useState } from 'react';
import {
  getWaitlistEntryDetails,
  hasWaitlistStore,
} from './utils/waitlist-section.helpers';

export const useWaitlistSection = () => {
  const analytics = useAnalytics();
  const { isLoggedIn } = useUserQuery();
  const { myWaitlistEntries } = useMyWaitlistQuery({ enabled: isLoggedIn });
  const { leaveWaitlist } = useWaitlistMutations();
  const [leavingEntryId, setLeavingEntryId] = useState<string | null>(null);

  const waitlistItems = useMemo(
    () =>
      (myWaitlistEntries ?? [])
        .filter(hasWaitlistStore)
        .filter((entry) => entry.status === 'waiting')
        .map((entry) => ({
          id: entry.id,
          storeId: entry.store.id,
          storeName: entry.store.name,
          details: getWaitlistEntryDetails(entry),
        })),
    [myWaitlistEntries],
  );

  const handleLeave = useCallback(
    ({ id, storeId }: { id: string; storeId: string }) => {
      setLeavingEntryId(id);

      leaveWaitlist(
        { storeId, entryId: id },
        {
          onSuccess: () => {
            analytics.track('waitlist_left', {
              store_id: storeId,
              source: 'profile',
            });
          },
          onSettled: () => setLeavingEntryId(null),
        },
      );
    },
    [analytics, leaveWaitlist],
  );

  return { waitlistItems, leavingEntryId, handleLeave };
};
