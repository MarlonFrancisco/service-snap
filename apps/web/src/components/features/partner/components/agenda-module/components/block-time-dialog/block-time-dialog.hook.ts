import { useBlockedTimeMutations } from '@/hooks';
import { useAgendaMemberRole } from '@/hooks/partner/use-agenda-member-role';
import { usePartnerStore } from '@/store';
import {
  selectWeekDates,
  toDateKey,
  useAgendaStore,
} from '@/store/admin/agenda';
import type { IProfessional } from '@/types/api/users.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { buildBlockedTimeItems } from './block-time-dialog.helpers';
import { blockTimeSchema, type TBlockTimeSchema } from './block-time.schema';

const EMPTY_PROFESSIONALS: IProfessional[] = [];

const EMPTY_VALUES: TBlockTimeSchema = {
  storeMemberId: '',
  from: '',
  to: '',
  isFullDay: false,
  startTime: '',
  endTime: '',
  isRecurring: false,
  reason: '',
};

/**
 * Bloqueio por intervalo: um profissional, de um dia até outro (férias), o
 * dia inteiro ou uma faixa de horário, opcionalmente toda semana.
 */
export const useBlockTimeDialog = () => {
  const storeId = usePartnerStore((state) => state.activeStore.id);
  const storeMembers = usePartnerStore(
    (state) => state.activeStore.storeMembers ?? EMPTY_PROFESSIONALS,
  );
  const { isProfessional, ownMember } = useAgendaMemberRole();
  const isOpen = useAgendaStore((state) => state.isBlockDialogOpen);
  const setIsBlockDialogOpen = useAgendaStore(
    (state) => state.setIsBlockDialogOpen,
  );
  const selectedProfessional = useAgendaStore(
    (state) => state.selectedProfessional,
  );
  const weekDates = useAgendaStore(selectWeekDates);
  const selectedDayIndex = useAgendaStore((state) => state.selectedDayIndex);
  const viewMode = useAgendaStore((state) => state.viewMode);
  const { createBulkBlockedTime, isCreatingBulkBlockedTime } =
    useBlockedTimeMutations({ storeId });

  const form = useForm<TBlockTimeSchema>({
    resolver: zodResolver(blockTimeSchema),
    defaultValues: EMPTY_VALUES,
  });

  const professionals = useMemo(
    () => (isProfessional ? (ownMember ? [ownMember] : []) : storeMembers),
    [isProfessional, ownMember, storeMembers],
  );

  // Abre no profissional do filtro e no dia que está na tela.
  useEffect(() => {
    if (!isOpen) return;

    const selectedDate = weekDates[selectedDayIndex];
    const isDayInView = viewMode === 'day' && !!selectedDate;
    const defaultMemberId = isProfessional
      ? (ownMember?.id ?? '')
      : selectedProfessional !== 'all'
        ? selectedProfessional
        : '';

    form.reset({
      ...EMPTY_VALUES,
      storeMemberId: defaultMemberId,
      from: toDateKey(isDayInView ? selectedDate : new Date()),
    });
  }, [
    isOpen,
    form,
    isProfessional,
    ownMember?.id,
    selectedProfessional,
    weekDates,
    selectedDayIndex,
    viewMode,
  ]);

  const isFullDay = form.watch('isFullDay');

  const handleClose = useCallback(() => {
    setIsBlockDialogOpen(false);
  }, [setIsBlockDialogOpen]);

  const handleSubmit = form.handleSubmit((values) => {
    createBulkBlockedTime(
      {
        storeMemberId: values.storeMemberId,
        blockedTimes: buildBlockedTimeItems(values),
      },
      { onSuccess: () => setIsBlockDialogOpen(false) },
    );
  });

  return {
    form,
    isOpen,
    isFullDay,
    professionals,
    isProfessionalLocked: isProfessional,
    isSubmitting: isCreatingBulkBlockedTime,
    handleClose,
    handleSubmit,
  };
};
