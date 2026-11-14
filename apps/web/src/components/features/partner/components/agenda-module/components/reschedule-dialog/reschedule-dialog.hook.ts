import { useAgendaMemberRole } from '@/hooks/partner/use-agenda-member-role';
import { useScheduleMutations } from '@/hooks/partner/use-schedule-mutations';
import { useAvailabilityQuery } from '@/hooks/use-query/use-availability-query';
import { usePartnerStore } from '@/store';
import { useAgendaStore } from '@/store/admin/agenda';
import type { IProfessional } from '@/types/api/users.types';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  formatDuration,
  formatShortDay,
  getClientName,
  getProfessionalFullName,
  getVisitDuration,
  getVisitItems,
} from '../agenda-grid/agenda-grid.helpers';

const EMPTY_PROFESSIONALS: IProfessional[] = [];

/**
 * Remarcar a partir dos detalhes: data, profissional (só quem faz todos os
 * serviços da visita) e um horário livre, ou um encaixe com hora digitada.
 */
export const useRescheduleDialog = () => {
  const storeId = usePartnerStore((state) => state.activeStore.id);
  const storeMembers = usePartnerStore(
    (state) => state.activeStore.storeMembers ?? EMPTY_PROFESSIONALS,
  );
  const { isProfessional, ownMember } = useAgendaMemberRole();
  const visit = useAgendaStore((state) => state.rescheduleVisit);
  const setRescheduleVisit = useAgendaStore(
    (state) => state.setRescheduleVisit,
  );
  const { rescheduleScheduleAsync, isReschedulingSchedule } =
    useScheduleMutations({ storeId });

  const [date, setDate] = useState('');
  const [memberId, setMemberId] = useState('');
  const [pickedTime, setPickedTime] = useState('');
  const [isFitIn, setIsFitIn] = useState(false);
  const [fitInTime, setFitInTime] = useState('');

  const items = useMemo(() => (visit ? getVisitItems(visit) : []), [visit]);
  const serviceIds = useMemo(
    () => items.map((item) => item.service.id),
    [items],
  );

  // Reabrir para outra visita começa do estado dela.
  useEffect(() => {
    if (!visit) return;
    setDate(visit.date.slice(0, 10));
    setMemberId(visit.storeMember.id);
    setPickedTime('');
    setIsFitIn(false);
    setFitInTime('');
  }, [visit]);

  const professionals = useMemo(() => {
    if (isProfessional) return ownMember ? [ownMember] : [];

    return storeMembers.filter(
      (member) =>
        member.id === visit?.storeMember.id ||
        !member.services ||
        serviceIds.every((serviceId) =>
          member.services?.some((service) => service.id === serviceId),
        ),
    );
  }, [isProfessional, ownMember, storeMembers, serviceIds, visit]);

  const { slots, isLoadingSlots, isSlotsError } = useAvailabilityQuery({
    storeId,
    date: visit ? date : undefined,
    serviceIds,
    memberId,
  });

  const timeOptions = useMemo(
    () =>
      (slots ?? []).map((slot) => ({
        time: slot.time,
        isAvailable: slot.available,
      })),
    [slots],
  );

  const handleDateChange = useCallback((value: string) => {
    setDate(value);
    setPickedTime('');
  }, []);

  const handleMemberChange = useCallback((value: string) => {
    setMemberId(value);
    setPickedTime('');
  }, []);

  const handleToggleFitIn = useCallback(() => {
    setIsFitIn((current) => !current);
  }, []);

  const handleClose = useCallback(() => {
    setRescheduleVisit(undefined);
  }, [setRescheduleVisit]);

  const startTime = isFitIn ? fitInTime : pickedTime;
  const canSubmit = !!visit && !!date && !!memberId && !!startTime;

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!visit || !canSubmit) return;

      const isOtherMember = memberId !== visit.storeMember.id;

      try {
        await rescheduleScheduleAsync({
          visit,
          request: {
            date,
            startTime,
            storeMemberId: isOtherMember ? memberId : undefined,
          },
          professional: isOtherMember
            ? storeMembers.find((member) => member.id === memberId)
            : undefined,
        });
        setRescheduleVisit(undefined);
      } catch {
        // O toast de erro já sai na mutação; o diálogo fica para outra escolha.
      }
    },
    [
      visit,
      canSubmit,
      memberId,
      date,
      startTime,
      storeMembers,
      rescheduleScheduleAsync,
      setRescheduleVisit,
    ],
  );

  const summary = visit
    ? {
        clientName: getClientName(visit.user),
        serviceCount: items.length,
        services: items
          .map(
            (item) =>
              `${item.service.name} · ${formatDuration(item.service.duration)}`,
          )
          .join(' + '),
        duration: getVisitDuration(visit),
        current: `${formatShortDay(visit.date)} às ${visit.startTime}`,
        professionalName: getProfessionalFullName(visit.storeMember),
      }
    : null;

  return {
    isOpen: !!visit,
    summary,
    date,
    memberId,
    professionals,
    timeOptions,
    isLoadingSlots,
    isSlotsError,
    pickedTime,
    isFitIn,
    fitInTime,
    canSubmit,
    isSubmitting: isReschedulingSchedule,
    setPickedTime,
    setFitInTime,
    handleDateChange,
    handleMemberChange,
    handleToggleFitIn,
    handleClose,
    handleSubmit,
  };
};
