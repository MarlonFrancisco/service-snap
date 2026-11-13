'use client';

import { cn, Skeleton } from '@repo/ui';
import { History, Plus, Receipt } from 'lucide-react';
import Link from 'next/link';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../../../notifications-module/components/module-state';
import {
  MANAGEMENT_ACTIONS_CLASS,
  MANAGEMENT_BUTTON_CLASS,
  MANAGEMENT_BUTTON_ICON_CLASS,
  MANAGEMENT_CARD_CLASS,
  MANAGEMENT_KPI_CLASS,
  MANAGEMENT_KPI_LABEL_CLASS,
  MANAGEMENT_KPI_VALUE_CLASS,
  MANAGEMENT_LINE_CLASS,
  MANAGEMENT_LINE_TEXT_CLASS,
  MANAGEMENT_PRIMARY_BUTTON_CLASS,
  MANAGEMENT_SMALL_BUTTON_CLASS,
  MANAGEMENT_TEXT_CLASS,
} from '../../cash-module.styles';
import { CashNoAccess } from '../cash-state';
import {
  CashPaymentsTable,
  CashPaymentsTableSkeleton,
} from './cash-payments-table';
import { useCashOverview } from './cash-overview.hook';
import { CloseCashDialog } from './close-cash-dialog';
import { OpenCashDialog } from './open-cash-dialog';
import { RegisterPaymentDialog } from './register-payment-dialog';
import { VoidPaymentDialog } from './void-payment-dialog';

const HISTORY_HREF = '/partner/caixa/anteriores';

const SESSION_CARD_CLASS = cn(
  MANAGEMENT_CARD_CLASS,
  'flex-row flex-wrap items-center justify-between',
);

export const CashOverview = () => {
  const {
    storeId,
    storeState,
    hasNoAccess,
    formatMoney,
    currentSession,
    header,
    kpis,
    expectedCash,
    rows,
    isLoading,
    isError,
    isLoadingPayments,
    isPaymentsError,
    isRefreshingPayments,
    handleRetry,
    dialog,
    setDialog,
    handleDialogChange,
    voidTarget,
    setVoidTarget,
  } = useCashOverview();

  if (storeState === 'no-store') return <NoStoreState />;
  if (hasNoAccess) return <CashNoAccess />;

  if (storeState !== 'ready' || isLoading) {
    return (
      <div
        role="status"
        aria-label="Carregando o caixa"
        className="grid gap-[18px]"
      >
        <Skeleton className="h-[98px] rounded-[24px] bg-[#F0EEF4]" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <Skeleton
              key={kpi.label}
              className="h-[88px] rounded-[20px] bg-[#F0EEF4]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) return <ModuleErrorState onRetry={handleRetry} />;

  const renderPayments = () => {
    if (isLoadingPayments) return <CashPaymentsTableSkeleton />;
    if (isPaymentsError) {
      return <ModuleErrorState headingLevel="h3" onRetry={handleRetry} />;
    }
    if (rows.length === 0) {
      return (
        <ModuleStatePanel
          icon={Receipt}
          headingLevel="h3"
          title="Nenhum pagamento neste caixa ainda"
          description="Fechar um atendimento na agenda ou registrar um pagamento avulso faz ele aparecer aqui."
        />
      );
    }

    return (
      <CashPaymentsTable
        rows={rows}
        isRefreshing={isRefreshingPayments}
        onVoid={setVoidTarget}
      />
    );
  };

  return (
    <div className="grid gap-[18px]">
      {currentSession && header ? (
        <>
          <section
            aria-labelledby="cash-session-title"
            className={SESSION_CARD_CLASS}
          >
            <div className={MANAGEMENT_LINE_CLASS}>
              <h2 id="cash-session-title" className="text-lg font-bold">
                {header.title}
              </h2>
              <p className={MANAGEMENT_LINE_TEXT_CLASS}>{header.description}</p>
            </div>
            <div className={MANAGEMENT_ACTIONS_CLASS}>
              <button
                type="button"
                onClick={() => setDialog('register')}
                className={MANAGEMENT_BUTTON_CLASS}
              >
                <Plus
                  aria-hidden="true"
                  className={MANAGEMENT_BUTTON_ICON_CLASS}
                />
                Registrar pagamento
              </button>
              <button
                type="button"
                onClick={() => setDialog('close')}
                className={MANAGEMENT_PRIMARY_BUTTON_CLASS}
              >
                Fechar caixa
              </button>
            </div>
          </section>

          <ul
            aria-label="Recebido por forma de pagamento"
            className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5"
          >
            {kpis.map((kpi) => (
              <li key={kpi.label} className={MANAGEMENT_KPI_CLASS}>
                <span className={MANAGEMENT_KPI_LABEL_CLASS}>{kpi.label}</span>
                <b className={MANAGEMENT_KPI_VALUE_CLASS}>{kpi.value}</b>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className={MANAGEMENT_LINE_CLASS}>
              <b className="text-sm">Esperado na gaveta: {expectedCash}</b>
              <span className={MANAGEMENT_LINE_TEXT_CLASS}>
                Troco inicial mais o que entrou em dinheiro
              </span>
            </div>
            <Link
              href={HISTORY_HREF}
              className={cn(
                MANAGEMENT_BUTTON_CLASS,
                MANAGEMENT_SMALL_BUTTON_CLASS,
              )}
            >
              Caixas anteriores
            </Link>
          </div>

          {renderPayments()}

          <p className={MANAGEMENT_TEXT_CLASS}>
            Estornar marca o pagamento, sem apagar. Depois de fechar o caixa não
            dá mais para estornar: os totais do fechamento ficam gravados.
          </p>

          <CloseCashDialog
            storeId={storeId}
            session={currentSession}
            isOpen={dialog === 'close'}
            onOpenChange={handleDialogChange('close')}
            formatMoney={formatMoney}
          />
          <RegisterPaymentDialog
            storeId={storeId}
            isOpen={dialog === 'register'}
            onOpenChange={handleDialogChange('register')}
            formatMoney={formatMoney}
          />
          <VoidPaymentDialog
            storeId={storeId}
            payment={voidTarget}
            onClose={() => setVoidTarget(null)}
            formatMoney={formatMoney}
          />
        </>
      ) : (
        <section
          aria-labelledby="cash-session-title"
          className={SESSION_CARD_CLASS}
        >
          <div className={MANAGEMENT_LINE_CLASS}>
            <h2 id="cash-session-title" className="text-lg font-bold">
              Caixa fechado
            </h2>
            <p className={MANAGEMENT_LINE_TEXT_CLASS}>
              Abra o caixa com o troco da gaveta. Os pagamentos registrados a
              partir daí entram nele.
            </p>
          </div>
          <div className={MANAGEMENT_ACTIONS_CLASS}>
            <Link href={HISTORY_HREF} className={MANAGEMENT_BUTTON_CLASS}>
              <History
                aria-hidden="true"
                className={MANAGEMENT_BUTTON_ICON_CLASS}
              />
              Caixas anteriores
            </Link>
            <button
              type="button"
              onClick={() => setDialog('open')}
              className={MANAGEMENT_PRIMARY_BUTTON_CLASS}
            >
              Abrir caixa
            </button>
          </div>
        </section>
      )}

      <OpenCashDialog
        storeId={storeId}
        isOpen={dialog === 'open'}
        onOpenChange={handleDialogChange('open')}
        formatMoney={formatMoney}
      />
    </div>
  );
};
