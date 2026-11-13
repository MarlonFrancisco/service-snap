import { useCallback, useOptimistic, useTransition } from 'react';
import {
  SEARCH_RATING_ANY_VALUE,
  SEARCH_RATING_FILTER_OPTIONS,
} from '../../search.constants';
import {
  getRatingFilterLabel,
  hasActiveSearchFilters,
  parseMinRating,
} from '../../search.helpers';
import {
  useSearchFiltersNavigation,
  useSearchUrlState,
} from '../../search.hook';
import type { TSearchFilters } from '../../search.types';

/**
 * Estado dos chips de filtro. A URL é a fonte da verdade; o `useOptimistic`
 * marca o chip na hora enquanto a navegação (com prefetch no server) termina.
 */
export const useSearchFilters = () => {
  const { filters } = useSearchUrlState();
  const { updateFilters } = useSearchFiltersNavigation();
  const [isUpdating, startTransition] = useTransition();
  const [optimisticFilters, setOptimisticFilters] = useOptimistic(filters);

  const applyFilters = useCallback(
    (next: TSearchFilters) => {
      startTransition(() => {
        setOptimisticFilters(next);
        updateFilters(next);
      });
    },
    [setOptimisticFilters, updateFilters],
  );

  const toggleAvailableToday = useCallback(() => {
    applyFilters({
      ...optimisticFilters,
      availableToday: optimisticFilters.availableToday ? undefined : true,
    });
  }, [applyFilters, optimisticFilters]);

  const changeMinRating = useCallback(
    (value: string) => {
      applyFilters({ ...optimisticFilters, minRating: parseMinRating(value) });
    },
    [applyFilters, optimisticFilters],
  );

  const clearFilters = useCallback(() => applyFilters({}), [applyFilters]);

  return {
    isAvailableToday: Boolean(optimisticFilters.availableToday),
    isRatingActive: Boolean(optimisticFilters.minRating),
    ratingValue: optimisticFilters.minRating ?? SEARCH_RATING_ANY_VALUE,
    ratingLabel: getRatingFilterLabel(optimisticFilters.minRating),
    ratingOptions: SEARCH_RATING_FILTER_OPTIONS,
    hasActiveFilters: hasActiveSearchFilters(optimisticFilters),
    isUpdating,
    toggleAvailableToday,
    changeMinRating,
    clearFilters,
  };
};
