'use client';

import { useCashSessionQuery } from '@/hooks/partner/use-cash-query';
import { useMemo } from 'react';
import {
  formatDayAndClock,
  formatSignedMoney,
  getCashDifference,
  getMemberName,
  PAYMENT_METHOD_SHORT_LABEL,
  PAYMENT_TOTALS_ORDER,
  toPaymentRow,
} from '../../../cash-module.helpers';
import { useManagementAccess } from '../../../cash-module.hook';
import type {
  TCashSessionDetailRow,
  TCashSessionDialogConfig,
} from './cash-session-dialog.types';

export const useCashSessionDialog = ({
  storeId,
  sessionId,
  formatMoney,
}: Omit<TCashSessionDialogConfig, 'onClose'>) => {
  const { memberNames } = useManagementAccess();
  const { session, isLoadingSession, isSessionError, refetchSession } =
    useCashSessionQuery({ storeId, sessionId });

  const title = session
    ? `Caixa de ${formatDayAndClock(session.openedAt)}`
    : 'Caixa';

  const people = useMemo(() => {
    if (!session) return '';

    const opened = `Aberto por ${session.openedByName || getMemberName(memberNames, session.openedById)}`;

    return session.closedAt
      ? `${opened} · fechado por ${getMemberName(memberNames, session.closedById)} em ${formatDayAndClock(session.closedAt)}`
      : `${opened} · ainda aberto`;
  }, [session, memberNames]);

  const cashRows = useMemo((): TCashSessionDetailRow[] => {
    if (!session) return [];

    // Fechado: vale o que foi gravado; aberto: o que entrou até agora
    const expected = session.expectedCash ?? session.summary.expectedCash;
    const difference = getCashDifference(session);

    return [
      { label: 'Troco inicial', value: formatMoney(session.openingAmount) },
      {
        label: 'Recebido em dinheiro',
        value: formatMoney(session.totals?.cash ?? session.summary.totals.cash),
      },
      {
        label: 'Esperado na gaveta',
        value: formatMoney(expected),
        isTotal: true,
      },
      ...(session.countedCash !== null
        ? [
            {
              label: 'Dinheiro contado',
              value: formatMoney(session.countedCash),
            },
            {
              label: 'Diferença',
              value:
                difference === null
                  ? '—'
                  : formatSignedMoney(difference, formatMoney),
            },
          ]
        : []),
    ];
  }, [session, formatMoney]);

  const methodRows = useMemo((): TCashSessionDetailRow[] => {
    if (!session) return [];

    const totals = session.totals ?? session.summary.totals;

    return PAYMENT_TOTALS_ORDER.map((method) => ({
      label: PAYMENT_METHOD_SHORT_LABEL[method],
      value: formatMoney(totals[method]),
    }));
  }, [session, formatMoney]);

  const paymentRows = useMemo(
    () =>
      (session?.payments ?? []).map((payment) =>
        toPaymentRow(payment, memberNames, formatMoney, { withDay: true }),
      ),
    [session, memberNames, formatMoney],
  );

  return {
    title,
    people,
    notes: session?.notes ?? null,
    cashRows,
    methodRows,
    paymentRows,
    isLoading: isLoadingSession,
    isError: isSessionError,
    handleRetry: () => void refetchSession(),
  };
};
