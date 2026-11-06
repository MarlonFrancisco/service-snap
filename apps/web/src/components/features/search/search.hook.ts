import { useAnalytics } from '@/providers/analytics.provider';
import { useEffect, useRef } from 'react';
import { SEARCH_LIST_NAME } from './search.constants';

type TUseSearchResultsAnalyticsConfig = {
  query: string;
  category: string | null;
  location: string | null;
  /** Só o `id` importa aqui; aceita o formato cru da API de busca. */
  data: ReadonlyArray<{ id: string }> | undefined;
  isPending: boolean;
  isError: boolean;
};

/**
 * Registra o desfecho de cada busca (resultados, vazio ou erro) uma única vez
 * por combinação de termo, categoria e local.
 */
export const useSearchResultsAnalytics = ({
  query,
  category,
  location,
  data,
  isPending,
  isError,
}: TUseSearchResultsAnalyticsConfig) => {
  const analytics = useAnalytics();
  const lastTrackedKey = useRef<string | null>(null);

  useEffect(() => {
    if (isPending || !query) return;

    const outcome = isError ? 'error' : data?.length ? 'results' : 'empty';
    const trackKey = [query, category, location, outcome].join('|');
    if (lastTrackedKey.current === trackKey) return;
    lastTrackedKey.current = trackKey;

    const filters = {
      ...(category && { category }),
      ...(location && { location }),
    };

    if (outcome === 'error') {
      analytics.track('search_failed', { search_term: query });
      return;
    }

    if (outcome === 'empty' || !data) {
      analytics.track('search_no_results', { search_term: query, ...filters });
      return;
    }

    analytics.track('view_item_list', {
      item_list_name: SEARCH_LIST_NAME,
      results_count: data.length,
      item_ids: data.map((store) => store.id),
    });
  }, [analytics, query, category, location, data, isPending, isError]);
};
