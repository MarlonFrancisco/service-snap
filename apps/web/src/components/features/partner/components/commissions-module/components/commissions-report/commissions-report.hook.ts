'use client';

import { useCommissionReportQuery } from '@/hooks/partner/use-commissions-query';
import { useMemo, useState } from 'react';
import { useManagementAccess } from '../../../cash-module/cash-module.hook';
import {
  getCommissionKpis,
  toCommissionLineRow,
} from '../../commissions-module.helpers';
import { useCommissionsPeriod } from '../../commissions-module.hook';
import type { TCommissionProfessionalRow } from './commissions-report.types';

/**
 * Relatório da equipe no período. Uma consulta traz todos os atendimentos; o
 * detalhe de cada profissional é só um filtro do que já veio.
 */
export const useCommissionsReport = () => {
  const { storeId, storeState, canManage, formatMoney } = useManagementAccess();
  const periodState = useCommissionsPeriod();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const canQuery =
    storeState === 'ready' && canManage && !periodState.periodError;

  const {
    report,
    isLoadingReport,
    isFetchingReport,
    isReportError,
    refetchReport,
  } = useCommissionReportQuery({
    storeId,
    query: periodState.period,
    scope: 'team',
    enabled: canQuery,
  });

  const professionals = useMemo(() => report?.professionals ?? [], [report]);

  // Sem escolha (ou com alguém que saiu do período), vale o primeiro da lista
  const activeMemberId =
    professionals.find((item) => item.storeMemberId === selectedMemberId)
      ?.storeMemberId ??
    professionals[0]?.storeMemberId ??
    null;

  const professionalRows = useMemo(
    (): TCommissionProfessionalRow[] =>
      professionals.map((item) => ({
        storeMemberId: item.storeMemberId,
        name: item.professionalName,
        attendances: String(item.attendances),
        base: formatMoney(item.baseTotal),
        commission: formatMoney(item.commissionTotal),
        isSelected: item.storeMemberId === activeMemberId,
      })),
    [professionals, activeMemberId, formatMoney],
  );

  const selectedName =
    professionals.find((item) => item.storeMemberId === activeMemberId)
      ?.professionalName ?? '';

  const lineRows = useMemo(
    () =>
      (report?.lines ?? [])
        .filter((line) => line.storeMemberId === activeMemberId)
        .map((line) => toCommissionLineRow(line, formatMoney)),
    [report, activeMemberId, formatMoney],
  );

  const kpis = useMemo(
    () => getCommissionKpis(report?.totals, formatMoney),
    [report, formatMoney],
  );

  return {
    periodState,
    kpis,
    professionalRows,
    selectedName,
    lineRows,
    handleSelectMember: setSelectedMemberId,
    isLoading: storeState !== 'ready' || isLoadingReport,
    isError: isReportError,
    isRefreshing: isFetchingReport && !isLoadingReport,
    handleRetry: () => void refetchReport(),
  };
};
