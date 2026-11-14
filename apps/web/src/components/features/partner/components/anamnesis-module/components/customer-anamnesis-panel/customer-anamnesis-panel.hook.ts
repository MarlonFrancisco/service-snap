'use client';

import {
  formatDateTime,
  formatShortDay,
} from '@/components/features/anamnesis/anamnesis.helpers';
import { useCustomerAnamnesisQuery } from '@/hooks/partner/use-anamnesis-query';
import { useMemo, useState } from 'react';
import { useAnamnesisAccess } from '../../anamnesis-module.hook';
import { getMemberName } from '../../anamnesis-module.helpers';
import type {
  TCustomerAnamnesisPanelConfig,
  TCustomerAnamnesisRow,
} from './customer-anamnesis-panel.types';

/** Fichas do cliente: a lista não traz respostas; abrir é outra leitura. */
export const useCustomerAnamnesisPanel = ({
  customerId,
}: TCustomerAnamnesisPanelConfig) => {
  const { storeId, members, isManagement, storeState } = useAnamnesisAccess();
  const [openRow, setOpenRow] = useState<TCustomerAnamnesisRow | null>(null);

  const {
    entries,
    isLoadingEntries,
    isEntriesError,
    isEntriesForbidden,
    isFetchingEntries,
    refetchEntries,
  } = useCustomerAnamnesisQuery({
    storeId,
    customerId,
    enabled: storeState === 'ready',
  });

  const rows = useMemo<TCustomerAnamnesisRow[]>(
    () =>
      entries.map((entry) => {
        const professional = entry.schedule
          ? getMemberName(members, entry.schedule.storeMemberId)
          : null;
        const day = entry.schedule
          ? formatShortDay(entry.schedule.date)
          : `Enviada em ${formatDateTime(entry.submittedAt)}`;

        return {
          id: entry.id,
          formName: entry.formName,
          meta: [day, professional].filter(Boolean).join(' · '),
          appointmentLabel: entry.schedule
            ? `${formatShortDay(entry.schedule.date)} às ${entry.schedule.startTime.slice(0, 5)} com ${professional}`
            : null,
        };
      }),
    [entries, members],
  );

  return {
    storeId,
    rows,
    isLoading: isLoadingEntries || storeState === 'loading',
    isError: isEntriesError && !isEntriesForbidden,
    isForbidden: isEntriesForbidden,
    isRetrying: isFetchingEntries,
    handleRetry: () => void refetchEntries(),
    canDelete: isManagement,
    openRow,
    handleOpen: setOpenRow,
    handleClose: () => setOpenRow(null),
  };
};
