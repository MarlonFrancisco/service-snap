import { useAnalytics } from '@/providers/analytics.provider';
import type { TAnalyticsEventName } from '@repo/analytics';
import { useCallback, type MouseEvent } from 'react';
import type { TUseTrackedLinkConfig } from './tracked-link.types';

export const useTrackedLink = <E extends TAnalyticsEventName>({
  event,
  properties,
  onClick,
}: TUseTrackedLinkConfig<E>) => {
  const analytics = useAnalytics();

  const handleClick = useCallback(
    (clickEvent: MouseEvent<HTMLAnchorElement>) => {
      analytics.track(event, properties);
      onClick?.(clickEvent);
    },
    [analytics, event, properties, onClick],
  );

  return { handleClick };
};
