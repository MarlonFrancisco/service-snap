import { useAnalytics } from '@/providers/analytics.provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { SEARCH_FILTER_PARAMS, SEARCH_LIST_NAME } from './search.constants';
import {
  buildSearchFiltersHref,
  hasActiveSearchFilters,
  parseSearchFilters,
} from './search.helpers';
import type { TSearchFilters, TSearchUrlParams } from './search.types';

type TUseSearchResultsAnalyticsConfig = {
  query: string;
  category: string | null;
  location: string | null;
  filters?: TSearchFilters;
  /** Só o `id` importa aqui; aceita o formato cru da API de busca. */
  data: ReadonlyArray<{ id: string }> | undefined;
  isPending: boolean;
  isError: boolean;
};

/**
 * Fonte única dos parâmetros da busca na URL: termo, local, categoria e os
 * filtros já validados. `searchParams` é a mesma chave que a página server usa
 * no prefetch, para o cache hidratar sem refetch.
 */
export const useSearchUrlState = () => {
  const params = useSearchParams();

  return useMemo(() => {
    const query = params.get('query') ?? '';
    const location = params.get('location')?.trim() || undefined;
    const category = params.get('category')?.trim() || undefined;
    const filters = parseSearchFilters({
      minRating: params.get(SEARCH_FILTER_PARAMS.minRating),
      availableToday: params.get(SEARCH_FILTER_PARAMS.availableToday),
    });
    const searchParams: TSearchUrlParams = {
      query,
      location,
      category,
      ...filters,
    };

    return {
      query,
      location,
      category,
      filters,
      hasActiveFilters: hasActiveSearchFilters(filters),
      searchParams,
    };
  }, [params]);
};

/** Troca os filtros na URL mantendo termo, local e categoria. */
export const useSearchFiltersNavigation = () => {
  const router = useRouter();
  const params = useSearchParams();

  const updateFilters = useCallback(
    (filters: TSearchFilters) => {
      router.replace(buildSearchFiltersHref(params, filters), {
        scroll: false,
      });
    },
    [params, router],
  );

  const clearFilters = useCallback(() => updateFilters({}), [updateFilters]);

  return { updateFilters, clearFilters };
};

/**
 * Registra o desfecho de cada busca (resultados, vazio ou erro) uma única vez
 * por combinação de termo, categoria, local e filtros.
 */
export const useSearchResultsAnalytics = ({
  query,
  category,
  location,
  filters,
  data,
  isPending,
  isError,
}: TUseSearchResultsAnalyticsConfig) => {
  const analytics = useAnalytics();
  const lastTrackedKey = useRef<string | null>(null);
  const minRating = filters?.minRating;
  const availableToday = filters?.availableToday;

  useEffect(() => {
    if (isPending || !query) return;

    const outcome = isError ? 'error' : data?.length ? 'results' : 'empty';
    const trackKey = [
      query,
      category,
      location,
      minRating,
      availableToday,
      outcome,
    ].join('|');
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
  }, [
    analytics,
    query,
    category,
    location,
    minRating,
    availableToday,
    data,
    isPending,
    isError,
  ]);
};
