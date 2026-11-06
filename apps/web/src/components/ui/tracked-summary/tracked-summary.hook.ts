import { useAnalytics } from '@/providers/analytics.provider';
import type { TAnalyticsEventName } from '@repo/analytics';
import { useCallback, type MouseEvent } from 'react';
import type { TUseTrackedSummaryConfig } from './tracked-summary.types';

export const useTrackedSummary = <E extends TAnalyticsEventName>({
  event,
  properties,
  onClick,
}: TUseTrackedSummaryConfig<E>) => {
  const analytics = useAnalytics();

  // O clique (ou Enter/Espaço) chega antes do `<details>` alternar, então
  // `open` ainda é o estado anterior. Usar o clique, e não o evento `toggle`,
  // evita contar os itens que já começam abertos.
  const handleClick = useCallback(
    (clickEvent: MouseEvent<HTMLElement>) => {
      const details = clickEvent.currentTarget.parentElement;
      const isOpening = details instanceof HTMLDetailsElement && !details.open;

      if (isOpening) analytics.track(event, properties);
      onClick?.(clickEvent);
    },
    [analytics, event, properties, onClick],
  );

  return { handleClick };
};
