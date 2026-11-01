'use client';
import { useNotificationsMutations } from '@/hooks/partner/use-notifications-mutations/use-notifications-mutations.hook';
import { useNotificationsQuery } from '@/hooks/use-query/use-notifications-query/use-notifications-query.hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStoreAvailability } from '../notifications-module.hook';
import {
  formatTimestamp,
  getStatusBadgeConfig,
} from '../notifications-module.utils';
import type { TNotificationHistoryRow } from './notifications-history.types';

const ALL_FILTER = 'all';
const PAGE_SIZE = 5;

export const useNotificationsHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>(ALL_FILTER);
  const [filterStatus, setFilterStatus] = useState<string>(ALL_FILTER);
  const [page, setPage] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { storeId, storeAvailability, retryStore } = useStoreAvailability();

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterType, filterStatus]);

  const notificationHistoryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      type: filterType,
      status: filterStatus,
      search: searchQuery,
    }),
    [page, filterType, filterStatus, searchQuery],
  );

  const {
    notificationsHistory,
    notificationsMeta,
    isNotificationsHistoryLoading,
    isNotificationsHistoryError,
    isNotificationsHistoryFetching,
    refetchNotificationsHistory,
  } = useNotificationsQuery({
    storeId,
    includeNotificationsHistory: true,
    notificationHistoryParams,
  });

  const {
    updateNotificationsHistoryMutation,
    deleteNotificationsHistoryMutation,
    markAllAsReadNotificationsHistoryMutation,
  } = useNotificationsMutations({
    storeId,
    notificationHistoryParams,
  });

  const isLoading =
    storeAvailability === 'loading' || isNotificationsHistoryLoading;
  const isError = storeAvailability === 'error' || isNotificationsHistoryError;
  const hasNoStore = storeAvailability === 'no-store';
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    filterType !== ALL_FILTER ||
    filterStatus !== ALL_FILTER;

  // Excluir a última linha de uma página não pode parecer um histórico vazio.
  useEffect(() => {
    if (
      !isLoading &&
      !isError &&
      notificationsHistory.length === 0 &&
      page > 1
    ) {
      setPage((currentPage) => currentPage - 1);
    }
  }, [isLoading, isError, notificationsHistory.length, page]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      updateNotificationsHistoryMutation.mutate({
        id: notificationId,
        read: true,
      });
    },
    [updateNotificationsHistoryMutation],
  );

  const markAllAsRead = useCallback(() => {
    markAllAsReadNotificationsHistoryMutation.mutate();
  }, [markAllAsReadNotificationsHistoryMutation]);

  const requestDelete = useCallback((notificationId: string) => {
    setPendingDeleteId(notificationId);
  }, []);

  const cancelDelete = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!pendingDeleteId) return;

    deleteNotificationsHistoryMutation.mutate(pendingDeleteId, {
      onSettled: () => setPendingDeleteId(null),
    });
  }, [deleteNotificationsHistoryMutation, pendingDeleteId]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterType(ALL_FILTER);
    setFilterStatus(ALL_FILTER);
  }, []);

  const handleRetry = useCallback(() => {
    if (storeAvailability !== 'ready') {
      retryStore();
      return;
    }
    void refetchNotificationsHistory();
  }, [storeAvailability, retryStore, refetchNotificationsHistory]);

  const notifications = useMemo<TNotificationHistoryRow[]>(
    () =>
      notificationsHistory.map((notification) => ({
        ...notification,
        statusBadge: getStatusBadgeConfig(notification.status),
        timeLabel: formatTimestamp(new Date(notification.timestamp)),
      })),
    [notificationsHistory],
  );

  const unreadCount = useMemo(
    () => notificationsHistory.filter((n) => !n.read).length,
    [notificationsHistory],
  );

  const totalPages = notificationsMeta?.totalPages || 1;

  return {
    notifications,
    unreadCount,
    searchQuery,
    filterType,
    filterStatus,
    hasActiveFilters,
    setSearchQuery,
    setFilterType,
    setFilterStatus,
    clearFilters,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead: markAllAsReadNotificationsHistoryMutation.isPending,
    pendingDeleteId,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting: deleteNotificationsHistoryMutation.isPending,
    page,
    totalPages,
    goToPreviousPage: () => setPage((current) => Math.max(1, current - 1)),
    goToNextPage: () => setPage((current) => Math.min(totalPages, current + 1)),
    isLoading,
    isError,
    hasNoStore,
    handleRetry,
    isRetrying: isNotificationsHistoryFetching,
  };
};
