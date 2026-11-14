'use client';

import { useAdminAuditLogsQuery } from '@/hooks/use-query/use-admin-query';
import { useCallback, useMemo } from 'react';
import { toAuditLogRow } from '../../../partner/components/audit-logs-module/audit-logs-module.helpers';
import {
  useAuditLogFilters,
  useAuditLogPager,
  useAuditLogSelection,
} from '../../../partner/components/audit-logs-module/audit-logs-module.hook';

/** Histórico de todas as lojas; mesmos filtros da loja, sem "Pessoa". */
export const useAdminAuditLogs = () => {
  const filters = useAuditLogFilters();

  const {
    auditLogs,
    auditLogsMeta,
    isLoadingAuditLogs,
    isFetchingAuditLogs,
    isAuditLogsError,
    refetchAuditLogs,
  } = useAdminAuditLogsQuery(filters.query);

  const rows = useMemo(
    () => auditLogs.map((log) => toAuditLogRow(log)),
    [auditLogs],
  );
  const { selectedRow, handleSelectRow, detailsHeadingRef } =
    useAuditLogSelection(rows);
  const pager = useAuditLogPager(auditLogsMeta, filters.setPage);

  const handleRetry = useCallback(() => {
    void refetchAuditLogs();
  }, [refetchAuditLogs]);

  return {
    filters: {
      from: filters.from,
      to: filters.to,
      onFromChange: filters.setFrom,
      onToChange: filters.setTo,
      area: filters.area,
      onAreaChange: filters.setArea,
      rangeHint: filters.rangeHint,
    },
    rows,
    selectedRow,
    handleSelectRow,
    detailsHeadingRef,
    isLoading: isLoadingAuditLogs,
    isError: isAuditLogsError,
    isRefreshing: isFetchingAuditLogs && !isLoadingAuditLogs,
    handleRetry,
    hasActiveFilters: filters.hasActiveFilters,
    clearFilters: filters.clearFilters,
    ...pager,
  };
};
