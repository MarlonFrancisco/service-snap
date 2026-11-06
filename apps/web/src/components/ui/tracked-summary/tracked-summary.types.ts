import type {
  TAnalyticsEventName,
  TAnalyticsEventProperties,
} from '@repo/analytics';
import type { HTMLAttributes } from 'react';

export type TTrackedSummaryConfig<E extends TAnalyticsEventName> =
  HTMLAttributes<HTMLElement> & {
    /** Evento do catálogo disparado quando o `<details>` é aberto. */
    event: E;
    /** Propriedades do evento, checadas contra o catálogo. */
    properties: TAnalyticsEventProperties<E>;
  };

export type TUseTrackedSummaryConfig<E extends TAnalyticsEventName> = Pick<
  TTrackedSummaryConfig<E>,
  'event' | 'properties' | 'onClick'
>;
