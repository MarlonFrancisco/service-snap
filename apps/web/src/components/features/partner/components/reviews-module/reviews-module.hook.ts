'use client';

import { useReviewsQuery } from '@/hooks/use-query/use-reviews-query';
import { useCallback, useMemo, useState } from 'react';
import { useStoreAvailability } from '../notifications-module/notifications-module.hook';
import {
  REVIEWS_DEFAULT_FILTER,
  REVIEWS_EMPTY_FILTER_STATE,
  REVIEWS_NO_REVIEWS_STATE,
  REVIEWS_PAGE_SIZE,
} from './reviews-module.constants';
import { filterReviews, getReviewsSummary } from './reviews-module.helpers';
import type { TReviewsFilter, TReviewsLoadState } from './reviews-module.types';

export const useReviewsModule = () => {
  const { storeId, storeAvailability, retryStore } = useStoreAvailability();
  const { reviews, isReviewsError, isReviewsFetching, refetchReviews } =
    useReviewsQuery({ storeId });

  const [filter, setFilter] = useState<TReviewsFilter>(REVIEWS_DEFAULT_FILTER);
  const [page, setPage] = useState(1);
  // Guardado por loja: trocar de loja tira o aviso sem precisar de efeito
  const [forbiddenStoreId, setForbiddenStoreId] = useState('');

  const summary = useMemo(() => getReviewsSummary(reviews ?? []), [reviews]);
  const filteredReviews = useMemo(
    () => filterReviews(reviews ?? [], filter),
    [reviews, filter],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / REVIEWS_PAGE_SIZE),
  );
  // Responder some com o item do filtro "Sem resposta": a página não pode sobrar
  const currentPage = Math.min(page, totalPages);
  const pageReviews = filteredReviews.slice(
    (currentPage - 1) * REVIEWS_PAGE_SIZE,
    currentPage * REVIEWS_PAGE_SIZE,
  );

  const getLoadState = (): TReviewsLoadState => {
    if (storeAvailability !== 'ready') return storeAvailability;
    if (reviews === undefined) return isReviewsError ? 'error' : 'loading';
    return 'ready';
  };

  const handleFilterChange = useCallback((nextFilter: TReviewsFilter) => {
    setFilter(nextFilter);
    setPage(1);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPage(Math.max(1, currentPage - 1));
  }, [currentPage]);

  const goToNextPage = useCallback(() => {
    setPage(Math.min(totalPages, currentPage + 1));
  }, [currentPage, totalPages]);

  const handleRetry = useCallback(() => {
    if (storeAvailability !== 'ready') {
      retryStore();
      return;
    }
    void refetchReviews();
  }, [storeAvailability, retryStore, refetchReviews]);

  const handleReplyForbidden = useCallback(() => {
    setForbiddenStoreId(storeId);
  }, [storeId]);

  return {
    storeId,
    loadState: getLoadState(),
    handleRetry,
    isRetrying: isReviewsFetching,
    summary,
    filter,
    handleFilterChange,
    pageReviews,
    emptyState:
      summary.total === 0
        ? REVIEWS_NO_REVIEWS_STATE
        : REVIEWS_EMPTY_FILTER_STATE[filter],
    hasFilteredReviews: filteredReviews.length > 0,
    currentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
    isReplyForbidden: Boolean(storeId) && forbiddenStoreId === storeId,
    handleReplyForbidden,
  };
};
