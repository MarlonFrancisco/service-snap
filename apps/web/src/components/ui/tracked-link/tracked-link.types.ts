import type {
  TAnalyticsEventName,
  TAnalyticsEventProperties,
} from '@repo/analytics';
import type Link from 'next/link';
import type { ComponentProps } from 'react';

export type TTrackedLinkConfig<E extends TAnalyticsEventName> = ComponentProps<
  typeof Link
> & {
  /** Evento do catálogo disparado no clique. */
  event: E;
  /** Propriedades do evento, checadas contra o catálogo. */
  properties: TAnalyticsEventProperties<E>;
};

export type TUseTrackedLinkConfig<E extends TAnalyticsEventName> = Pick<
  TTrackedLinkConfig<E>,
  'event' | 'properties' | 'onClick'
>;
