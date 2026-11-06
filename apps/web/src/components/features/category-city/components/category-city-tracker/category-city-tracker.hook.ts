import { useAnalytics } from '@/providers/analytics.provider';
import { useEffect, useRef } from 'react';
import { CATEGORY_CITY_LIST_NAME } from '../../category-city-landing.helpers';
import type { TCategoryCityTrackerConfig } from './category-city-tracker.types';

/** Registra o resultado da página categoria/cidade uma vez por lista exibida. */
export const useCategoryCityTracker = ({
  status,
  categoryName,
  city,
  storeIds,
}: TCategoryCityTrackerConfig) => {
  const analytics = useAnalytics();
  const lastTrackedKey = useRef<string | null>(null);
  const listKey = [status, categoryName, city, ...storeIds].join('|');

  useEffect(() => {
    if (lastTrackedKey.current === listKey) return;
    lastTrackedKey.current = listKey;

    if (status === 'unavailable') {
      analytics.track('search_failed', { search_term: categoryName });
      return;
    }

    if (storeIds.length === 0) {
      analytics.track('search_no_results', {
        search_term: categoryName,
        category: categoryName,
        location: city,
      });
      return;
    }

    analytics.track('view_item_list', {
      item_list_name: CATEGORY_CITY_LIST_NAME,
      results_count: storeIds.length,
      item_ids: storeIds,
    });
    // `storeIds` muda de referência a cada render; o ref com `listKey` evita
    // disparar de novo para a mesma lista.
  }, [analytics, listKey, status, categoryName, city, storeIds]);
};
