import { cn } from '@repo/ui';
import { History, Search } from 'lucide-react';
import {
  ModuleErrorState,
  ModuleStatePanel,
} from '../../../notifications-module/components/module-state';
import {
  PANEL_BUTTON_CLASS,
  PANEL_PAGER_CLASS,
  PANEL_SMALL_BUTTON_CLASS,
  PANEL_TEXT_CLASS,
  PANEL_TITLE_CLASS,
} from '../../audit-logs-module.styles';
import { AuditLogDetails } from './audit-log-details';
import { AuditLogsFilters } from './audit-logs-filters';
import { AuditLogsTable, AuditLogsTableSkeleton } from './audit-logs-table';
import type { TAuditLogsBoardConfig } from './audit-logs-board.types';

/** Filtros, tabela e detalhes do histórico; os dados vêm de quem usa. */
export const AuditLogsBoard = ({
  headingLevel: Heading = 'h2',
  title,
  lead,
  filters,
  rows,
  selectedRow,
  onSelectRow,
  detailsHeadingRef,
  isLoading,
  isError,
  isRefreshing,
  onRetry,
  hasActiveFilters,
  onClearFilters,
  rangeLabel,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: TAuditLogsBoardConfig) => {
  const renderContent = () => {
    if (isLoading) return <AuditLogsTableSkeleton />;
    if (isError) {
      return (
        <ModuleErrorState
          headingLevel="h3"
          onRetry={onRetry}
          isRetrying={isRefreshing}
        />
      );
    }
    if (rows.length === 0) {
      return hasActiveFilters ? (
        <ModuleStatePanel
          icon={Search}
          headingLevel="h3"
          title="Nada encontrado"
          description="Nenhuma ação com esses filtros. Tente outro período ou outra área."
        >
          <button
            type="button"
            onClick={onClearFilters}
            className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
          >
            Limpar filtros
          </button>
        </ModuleStatePanel>
      ) : (
        <ModuleStatePanel
          icon={History}
          headingLevel="h3"
          title="Nenhuma ação ainda"
          description="O que a equipe, as integrações e a plataforma fizerem aparece aqui."
        />
      );
    }

    return (
      <AuditLogsTable
        rows={rows}
        selectedId={selectedRow?.id ?? null}
        onSelectRow={onSelectRow}
        isRefreshing={isRefreshing}
      />
    );
  };

  const showPager = !isLoading && !isError && rows.length > 0;

  return (
    <div className="grid gap-6">
      <div className="min-w-0">
        <Heading className={PANEL_TITLE_CLASS}>{title}</Heading>
        <p className={cn(PANEL_TEXT_CLASS, 'mt-0.5')}>{lead}</p>
      </div>

      <AuditLogsFilters {...filters} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid min-w-0 gap-3.5">
          {renderContent()}

          {showPager ? (
            <nav
              aria-label="Paginação do histórico"
              className={PANEL_PAGER_CLASS}
            >
              <span>{rangeLabel}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!hasNext}
                  className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
                >
                  Próxima
                </button>
              </div>
            </nav>
          ) : null}
        </div>

        <AuditLogDetails row={selectedRow} headingRef={detailsHeadingRef} />
      </div>
    </div>
  );
};
