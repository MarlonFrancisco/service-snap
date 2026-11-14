'use client';

import {
  useCashCurrentQuery,
  usePaymentsQuery,
} from '@/hooks/partner/use-cash-query';
import type { IStorePayment } from '@/types/api/cash.types';
import { useCallback, useMemo, useState } from 'react';
import {
  addDaysToDateKey,
  formatClock,
  formatDayAndClock,
  getMemberName,
  PAYMENT_METHOD_SHORT_LABEL,
  PAYMENT_TOTALS_ORDER,
  toDateKey,
  toPaymentRow,
} from '../../cash-module.helpers';
import { useManagementAccess } from '../../cash-module.hook';
import type { TCashDialog, TCashKpi } from './cash-overview.types';

const formatPaymentsCount = (count: number) =>
  `${count} ${count === 1 ? 'pagamento' : 'pagamentos'}`;

/**
 * Caixa aberto da loja e os pagamentos dele. A listagem por período traz a
 * origem de cada pagamento; um dia de folga em cada ponta cobre a diferença de
 * fuso entre a loja e quem está vendo, e o corte fica na hora da abertura.
 */
export const useCashOverview = () => {
  const { storeId, storeState, canManage, memberNames, formatMoney } =
    useManagementAccess();
  const canQuery = storeState === 'ready' && canManage;
  const [dialog, setDialog] = useState<TCashDialog>(null);
  const [voidTarget, setVoidTarget] = useState<IStorePayment | null>(null);

  const { currentSession, isLoadingCurrent, isCurrentError, refetchCurrent } =
    useCashCurrentQuery({ storeId, enabled: canQuery });

  const openedAt = currentSession?.openedAt ?? null;
  const paymentsQuery = useMemo(() => {
    const today = toDateKey(new Date());
    const openedDay = openedAt ? toDateKey(new Date(openedAt)) : today;

    return {
      from: addDaysToDateKey(openedDay, -1),
      to: addDaysToDateKey(today, 1),
    };
  }, [openedAt]);

  const {
    payments,
    isLoadingPayments,
    isFetchingPayments,
    isPaymentsError,
    refetchPayments,
  } = usePaymentsQuery({
    storeId,
    query: paymentsQuery,
    enabled: canQuery && !!currentSession,
  });

  const isSameDayAsOpening =
    !!openedAt && toDateKey(new Date(openedAt)) === toDateKey(new Date());

  const rows = useMemo(() => {
    if (!openedAt) return [];

    const openedTime = new Date(openedAt).getTime();

    return payments
      .filter((payment) => new Date(payment.paidAt).getTime() >= openedTime)
      .sort((a, b) => a.paidAt.localeCompare(b.paidAt))
      .map((payment) =>
        toPaymentRow(payment, memberNames, formatMoney, {
          withDay: !isSameDayAsOpening,
        }),
      );
  }, [payments, openedAt, memberNames, formatMoney, isSameDayAsOpening]);

  const header = useMemo(() => {
    if (!currentSession) return null;

    const since = isSameDayAsOpening
      ? formatClock(currentSession.openedAt)
      : formatDayAndClock(currentSession.openedAt);

    return {
      title: `Caixa aberto desde ${since}`,
      description: [
        `Aberto por ${currentSession.openedByName || getMemberName(memberNames, currentSession.openedById)}`,
        `troco inicial ${formatMoney(currentSession.openingAmount)}`,
        formatPaymentsCount(currentSession.summary.paymentsCount),
      ].join(' · '),
    };
  }, [currentSession, isSameDayAsOpening, memberNames, formatMoney]);

  const kpis = useMemo(
    (): TCashKpi[] =>
      PAYMENT_TOTALS_ORDER.map((method) => ({
        label: PAYMENT_METHOD_SHORT_LABEL[method],
        value: formatMoney(currentSession?.summary.totals[method] ?? 0),
      })),
    [currentSession, formatMoney],
  );

  const handleRetry = useCallback(() => {
    void refetchCurrent();
    if (currentSession) void refetchPayments();
  }, [refetchCurrent, refetchPayments, currentSession]);

  const handleDialogChange = useCallback(
    (target: Exclude<TCashDialog, null>) => (isOpen: boolean) =>
      setDialog(isOpen ? target : null),
    [],
  );

  return {
    storeId,
    storeState,
    hasNoAccess: storeState === 'ready' && !canManage,
    formatMoney,
    currentSession,
    header,
    kpis,
    expectedCash: formatMoney(currentSession?.summary.expectedCash ?? 0),
    rows,
    isLoading: isLoadingCurrent,
    isError: isCurrentError,
    isLoadingPayments,
    isPaymentsError,
    isRefreshingPayments: isFetchingPayments && !isLoadingPayments,
    handleRetry,
    dialog,
    setDialog,
    handleDialogChange,
    voidTarget,
    setVoidTarget,
  };
};
