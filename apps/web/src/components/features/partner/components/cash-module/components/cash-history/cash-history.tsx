'use client';

import { cn, Skeleton } from '@repo/ui';
import { ArrowLeft, History } from 'lucide-react';
import Link from 'next/link';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../../../notifications-module/components/module-state';
import {
  MANAGEMENT_BUTTON_CLASS,
  MANAGEMENT_BUTTON_ICON_CLASS,
  MANAGEMENT_CELL_CLASS,
  MANAGEMENT_CHIP_CLASS,
  MANAGEMENT_CHIP_TONE,
  MANAGEMENT_HEAD_CELL_CLASS,
  MANAGEMENT_LEAD_CLASS,
  MANAGEMENT_NUMBER_CLASS,
  MANAGEMENT_SMALL_BUTTON_CLASS,
  MANAGEMENT_TABLE_CLASS,
  MANAGEMENT_TABLE_WRAPPER_CLASS,
  MANAGEMENT_TITLE_CLASS,
} from '../../cash-module.styles';
import { CashNoAccess } from '../cash-state';
import { useCashHistory } from './cash-history.hook';
import { CashSessionDialog } from './cash-session-dialog';

const COLUMNS = [
  { label: 'Aberto em' },
  { label: 'Fechado em' },
  { label: 'Troco inicial', isNumber: true },
  { label: 'Recebido', isNumber: true },
  { label: 'Esperado na gaveta', isNumber: true },
  { label: 'Contado', isNumber: true },
  { label: 'Diferença', isNumber: true },
];

const SKELETON_ROWS = 5;

const TableHead = () => (
  <thead>
    <tr>
      {COLUMNS.map((column) => (
        <th
          key={column.label}
          scope="col"
          className={cn(
            MANAGEMENT_HEAD_CELL_CLASS,
            column.isNumber && 'text-right',
          )}
        >
          {column.label}
        </th>
      ))}
      <th scope="col" className={MANAGEMENT_HEAD_CELL_CLASS}>
        <span className="sr-only">Ações</span>
      </th>
    </tr>
  </thead>
);

export const CashHistory = () => {
  const {
    storeId,
    storeState,
    hasNoAccess,
    formatMoney,
    rows,
    page,
    totalPages,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
    isLoading,
    isError,
    isRefreshing,
    handleRetry,
    selectedId,
    setSelectedId,
  } = useCashHistory();

  if (storeState === 'no-store') return <NoStoreState />;
  if (hasNoAccess) return <CashNoAccess />;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando caixas anteriores"
          className={MANAGEMENT_TABLE_WRAPPER_CLASS}
        >
          <table className={cn(MANAGEMENT_TABLE_CLASS, 'min-w-[900px]')}>
            <TableHead />
            <tbody>
              {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <tr key={index} className="group">
                  {[...COLUMNS, { label: 'Ações' }].map((column) => (
                    <td key={column.label} className={MANAGEMENT_CELL_CLASS}>
                      <Skeleton className="h-4 w-full max-w-[110px] rounded-full bg-[#F0EEF4]" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (isError) {
      return <ModuleErrorState headingLevel="h3" onRetry={handleRetry} />;
    }
    if (rows.length === 0) {
      return (
        <ModuleStatePanel
          icon={History}
          headingLevel="h3"
          title="Nenhum caixa ainda"
          description="Os caixas abertos e fechados da loja aparecem aqui, com os totais gravados no fechamento."
        />
      );
    }

    return (
      <div
        role="region"
        aria-label="Caixas anteriores"
        aria-busy={isRefreshing || undefined}
        tabIndex={0}
        className={cn(
          MANAGEMENT_TABLE_WRAPPER_CLASS,
          isRefreshing && 'opacity-70',
        )}
      >
        <table className={cn(MANAGEMENT_TABLE_CLASS, 'min-w-[900px]')}>
          <TableHead />
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="group">
                <td
                  className={cn(
                    MANAGEMENT_CELL_CLASS,
                    'font-bold whitespace-nowrap',
                  )}
                >
                  {row.openedAt}
                </td>
                <td className={cn(MANAGEMENT_CELL_CLASS, 'whitespace-nowrap')}>
                  {row.closedAt ?? (
                    <span
                      className={cn(
                        MANAGEMENT_CHIP_CLASS,
                        MANAGEMENT_CHIP_TONE.ok,
                      )}
                    >
                      Aberto
                    </span>
                  )}
                </td>
                <td
                  className={cn(MANAGEMENT_CELL_CLASS, MANAGEMENT_NUMBER_CLASS)}
                >
                  {row.openingAmount}
                </td>
                <td
                  className={cn(MANAGEMENT_CELL_CLASS, MANAGEMENT_NUMBER_CLASS)}
                >
                  {row.received}
                </td>
                <td
                  className={cn(MANAGEMENT_CELL_CLASS, MANAGEMENT_NUMBER_CLASS)}
                >
                  {row.expectedCash}
                </td>
                <td
                  className={cn(MANAGEMENT_CELL_CLASS, MANAGEMENT_NUMBER_CLASS)}
                >
                  {row.countedCash}
                </td>
                <td
                  className={cn(MANAGEMENT_CELL_CLASS, MANAGEMENT_NUMBER_CLASS)}
                >
                  {row.differenceTone === 'neutral' ? (
                    row.difference
                  ) : (
                    <span
                      className={cn(
                        MANAGEMENT_CHIP_CLASS,
                        MANAGEMENT_CHIP_TONE[row.differenceTone],
                      )}
                    >
                      {row.difference}
                    </span>
                  )}
                </td>
                <td className={MANAGEMENT_CELL_CLASS}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    aria-label={`Ver o caixa aberto em ${row.openedAt}`}
                    className={cn(
                      MANAGEMENT_BUTTON_CLASS,
                      MANAGEMENT_SMALL_BUTTON_CLASS,
                    )}
                  >
                    Ver caixa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const showPager = !isLoading && !isError && totalPages > 1;

  return (
    <div className="grid gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className={MANAGEMENT_TITLE_CLASS}>Caixas anteriores</h2>
          <p className={MANAGEMENT_LEAD_CLASS}>
            Os totais e a diferença ficam gravados no fechamento.
          </p>
        </div>
        <Link href="/partner/caixa" className={MANAGEMENT_BUTTON_CLASS}>
          <ArrowLeft
            aria-hidden="true"
            className={MANAGEMENT_BUTTON_ICON_CLASS}
          />
          Caixa atual
        </Link>
      </div>

      {renderContent()}

      {showPager ? (
        <nav
          aria-label="Paginação dos caixas"
          className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#5F5C6E]"
        >
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goToPrevious}
              disabled={!hasPrevious}
              className={cn(
                MANAGEMENT_BUTTON_CLASS,
                MANAGEMENT_SMALL_BUTTON_CLASS,
              )}
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={goToNext}
              disabled={!hasNext}
              className={cn(
                MANAGEMENT_BUTTON_CLASS,
                MANAGEMENT_SMALL_BUTTON_CLASS,
              )}
            >
              Próxima
            </button>
          </div>
        </nav>
      ) : null}

      <CashSessionDialog
        storeId={storeId}
        sessionId={selectedId}
        onClose={() => setSelectedId(null)}
        formatMoney={formatMoney}
      />
    </div>
  );
};
