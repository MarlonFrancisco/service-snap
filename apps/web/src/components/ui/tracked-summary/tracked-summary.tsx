'use client';

import type { TAnalyticsEventName } from '@repo/analytics';
import { useTrackedSummary } from './tracked-summary.hook';
import type { TTrackedSummaryConfig } from './tracked-summary.types';

/**
 * `<summary>` que registra um evento quando o `<details>` pai é aberto.
 * Permite rastrear FAQs de server components sem convertê-los.
 */
export const TrackedSummary = <E extends TAnalyticsEventName>({
  event,
  properties,
  onClick,
  ...props
}: TTrackedSummaryConfig<E>) => {
  const { handleClick } = useTrackedSummary({ event, properties, onClick });

  return <summary {...props} onClick={handleClick} />;
};
