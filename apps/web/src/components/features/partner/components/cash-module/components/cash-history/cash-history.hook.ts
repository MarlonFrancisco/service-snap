'use client';

import { useCashSessionsQuery } from '@/hooks/partner/use-cash-query';
import { useCallback, useMemo, useState } from 'react';
import {
  formatDayAndClock,
  formatSignedMoney,
  getCashDifference,
  getDifferenceTone,
  sumPaymentTotals,
} from '../../cash-module.helpers';
import { useManagementAccess } from '../../cash-module.hook';
import type { TCashHistoryRow } from './cash-history.types';

const EMPTY = '—';

export const useCashHistory = () => {
  const { storeId, storeState, canManage, formatMoney } = useManagementAccess();
  const canQuery = storeState === 'ready' && canManage;
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    sessions,
    sessionsMeta,
    isLoadingSessions,
    isFetchingSessions,
    isSessionsError,
    refetchSessions,
  } = useCashSessionsQuery({ storeId, page, enabled: canQuery });

  const rows = useMemo(
    (): TCashHistoryRow[] =>
      sessions.map((session) => {
        const received = sumPaymentTotals(session.totals);
        const difference = getCashDifference(session);
        const formatOptional = (value: number | null) =>
          value === null ? EMPTY : formatMoney(value);

        return {
          id: session.id,
          openedAt: formatDayAndClock(session.openedAt),
          closedAt: session.closedAt
            ? formatDayAndClock(session.closedAt)
            : null,
          openingAmount: formatMoney(session.openingAmount),
          received: formatOptional(received),
          expectedCash: formatOptional(session.expectedCash),
          countedCash: formatOptional(session.countedCash),
          difference:
            difference === null
              ? EMPTY
              : formatSignedMoney(difference, formatMoney),
          differenceTone: getDifferenceTone(difference),
        };
      }),
    [sessions, formatMoney],
  );

  const totalPages = Math.max(sessionsMeta?.totalPages ?? 1, 1);

  const goToPrevious = useCallback(
    () => setPage((current) => Math.max(current - 1, 1)),
    [],
  );
  const goToNext = useCallback(
    () => setPage((current) => Math.min(current + 1, totalPages)),
    [totalPages],
  );

  const handleRetry = useCallback(() => {
    void refetchSessions();
  }, [refetchSessions]);

  return {
    storeId,
    storeState,
    hasNoAccess: storeState === 'ready' && !canManage,
    formatMoney,
    rows,
    page,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
    goToPrevious,
    goToNext,
    isLoading: storeState !== 'ready' || isLoadingSessions,
    isError: isSessionsError,
    isRefreshing: isFetchingSessions && !isLoadingSessions,
    handleRetry,
    selectedId,
    setSelectedId,
  };
};
