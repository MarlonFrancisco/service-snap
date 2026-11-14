'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import {
  ModuleStatePanel,
  NoStoreState,
} from '../../../notifications-module/components/module-state';
import { PANEL_PRIMARY_BUTTON_CLASS } from '../../audit-logs-module.styles';
import { AuditLogsBoard } from '../audit-logs-board';
import { useStoreAuditLogs } from './store-audit-logs.hook';

export const StoreAuditLogs = () => {
  const {
    storeState,
    hasNoAccess,
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
  } = useStoreAuditLogs();

  if (storeState === 'no-store') return <NoStoreState />;
  if (hasNoAccess) {
    return (
      <ModuleStatePanel
        icon={Lock}
        title="Sem acesso ao histórico"
        description="Só o dono e o gerente da loja veem o histórico de ações."
      >
        <Link href="/partner/agenda" className={PANEL_PRIMARY_BUTTON_CLASS}>
          Ir para a agenda
        </Link>
      </ModuleStatePanel>
    );
  }

  return (
    <AuditLogsBoard
      title="Histórico de ações"
      lead="Quem fez o quê na loja: equipe, integrações e a equipe do ServiceSnap. Só dono e gerente veem."
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
