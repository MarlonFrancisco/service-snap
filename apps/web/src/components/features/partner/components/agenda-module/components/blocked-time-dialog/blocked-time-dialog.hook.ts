import { useBlockedTimeMutations } from '@/hooks';
import { usePartnerStore } from '@/store';
import { useAgendaStore } from '@/store/admin/agenda';
import { useCallback } from 'react';
import {
  formatBlockedRange,
  formatShortDay,
  getProfessionalFullName,
} from '../agenda-grid/agenda-grid.helpers';

/** Bloqueio em faixa aberto pela grade: mostra o intervalo e permite remover. */
export const useBlockedTimeDialog = () => {
  const storeId = usePartnerStore((state) => state.activeStore.id);
  const blockedTime = useAgendaStore((state) => state.selectedBlockedTime);
  const setSelectedBlockedTime = useAgendaStore(
    (state) => state.setSelectedBlockedTime,
  );
  const { deleteBlockedTime, isDeletingBlockedTime } = useBlockedTimeMutations(
    { storeId },
  );

  const handleClose = useCallback(() => {
    setSelectedBlockedTime(undefined);
  }, [setSelectedBlockedTime]);

  const handleRemove = useCallback(() => {
    if (!blockedTime) return;

    deleteBlockedTime(blockedTime, {
      onSuccess: () => setSelectedBlockedTime(undefined),
    });
  }, [blockedTime, deleteBlockedTime, setSelectedBlockedTime]);

  const details = blockedTime
    ? {
        range: formatBlockedRange(blockedTime),
        day: blockedTime.isRecurring
          ? 'Toda semana'
          : formatShortDay(String(blockedTime.date)),
        professionalName: blockedTime.storeMember?.user
          ? getProfessionalFullName(blockedTime.storeMember)
          : '',
      }
    : null;

  return {
    isOpen: !!blockedTime,
    details,
    isRemoving: isDeletingBlockedTime,
    handleClose,
    handleRemove,
  };
};
