'use client';

import type { TAnalyticsEventName } from '@repo/analytics';
import Link from 'next/link';
import { useTrackedLink } from './tracked-link.hook';
import type { TTrackedLinkConfig } from './tracked-link.types';

/**
 * `next/link` que registra um evento de analytics no clique. Permite rastrear
 * CTAs de server components sem convertê-los em client components.
 */
export const TrackedLink = <E extends TAnalyticsEventName>({
  event,
  properties,
  onClick,
  ...props
}: TTrackedLinkConfig<E>) => {
  const { handleClick } = useTrackedLink({ event, properties, onClick });

  return <Link {...props} onClick={handleClick} />;
};
