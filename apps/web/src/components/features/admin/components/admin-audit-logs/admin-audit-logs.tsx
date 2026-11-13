'use client';

import { AuditLogsBoard } from '../../../partner/components/audit-logs-module/components/audit-logs-board';
import { useAdminAuditLogs } from './admin-audit-logs.hook';

export const AdminAuditLogs = () => {
  const {
    filters,
    rows,
    selectedRow,
    handleSelectRow,
    detailsHeadingRef,
    isLoading,
    isError,
    isRefreshing,
    handleRetry,
    hasActiveFilters,
    clearFilters,
    rangeLabel,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
  } = useAdminAuditLogs();

  return (
    <AuditLogsBoard
      headingLevel="h1"
      title="Histórico de ações"
      lead="O que a equipe das lojas, as integrações e a equipe do ServiceSnap fizeram em toda a plataforma."
      filters={filters}
      rows={rows}
      selectedRow={selectedRow}
      onSelectRow={handleSelectRow}
      detailsHeadingRef={detailsHeadingRef}
      isLoading={isLoading}
      isError={isError}
      isRefreshing={isRefreshing}
      onRetry={handleRetry}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={clearFilters}
      rangeLabel={rangeLabel}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      onPrevious={goToPrevious}
      onNext={goToNext}
    />
  );
};
