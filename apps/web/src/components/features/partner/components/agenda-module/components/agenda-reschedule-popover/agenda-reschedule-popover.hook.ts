import { useScheduleMutations } from '@/hooks/partner/use-schedule-mutations';
import { usePartnerStore } from '@/store';
import { useAgendaStore } from '@/store/admin/agenda';
import { useCallback, useEffect } from 'react';
import {
  formatShortDay,
  getClientName,
} from '../agenda-grid/agenda-grid.helpers';

/**
 * Confirmação do arrasto: "Remarcar [cliente] para [dia] às [hora]?". Só ao
 * confirmar a visita vai para a API; cancelar devolve o bloco ao lugar.
 */
export const useAgendaReschedulePopover = () => {
  const storeId = usePartnerStore((state) => state.activeStore.id);
  const storeMembers = usePartnerStore(
    (state) => state.activeStore.storeMembers,
  );
  const pending = useAgendaStore((state) => state.pendingReschedule);
  const setPendingReschedule = useAgendaStore(
    (state) => state.setPendingReschedule,
  );
  const { rescheduleSchedule, isReschedulingSchedule } = useScheduleMutations(
    { storeId },
  );

  const handleCancel = useCallback(() => {
    setPendingReschedule(undefined);
  }, [setPendingReschedule]);

  // A âncora é fixa na tela: rolar a grade deixaria o popover solto.
  useEffect(() => {
    if (!pending) return;

    const handleScroll = () => setPendingReschedule(undefined);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [pending, setPendingReschedule]);

  const handleConfirm = useCallback(() => {
    if (!pending) return;

    const { visit, date, time, storeMemberId } = pending;
    const professional = storeMemberId
      ? storeMembers?.find((member) => member.id === storeMemberId)
      : undefined;

    rescheduleSchedule({
      visit,
      request: { date, startTime: time, storeMemberId },
      professional,
    });
    setPendingReschedule(undefined);
  }, [pending, storeMembers, rescheduleSchedule, setPendingReschedule]);

  const question = pending
    ? `Remarcar ${getClientName(pending.visit.user)} para ${formatShortDay(pending.date)} às ${pending.time}${pending.professionalName ? ` com ${pending.professionalName}` : ''}?`
    : '';

  return {
    pending,
    question,
    isRescheduling: isReschedulingSchedule,
    handleCancel,
    handleConfirm,
  };
};
