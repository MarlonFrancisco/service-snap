'use client';

import { useUsersMutations } from '@/hooks/use-mutations/use-users-mutations';
import { useAvailabilityQuery } from '@/hooks/use-query/use-availability-query';
import { isApiHttpError } from '@/service/api';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  getPolicyBlockMessage,
  getProfessionalName,
} from '../utils/bookings-section.helpers';
import {
  buildRescheduleDays,
  formatCurrentVisitTime,
  getWeekOffsetFor,
  hasNextWeek,
  startOfToday,
} from './reschedule-dialog.helpers';
import type {
  TRescheduleDay,
  TRescheduleDialogConfig,
} from './reschedule-dialog.types';

const SLOT_TAKEN_MESSAGE = 'Esse horário acabou de ser ocupado. Escolha outro.';

export const useRescheduleDialog = ({
  visit,
  onClose,
  onPolicyBlocked,
}: TRescheduleDialogConfig) => {
  const { appointment } = visit;
  const { store } = appointment;
  const currentDateKey = appointment.date.slice(0, 10);
  const today = useMemo(() => startOfToday(), []);
  const { rescheduleBooking, isReschedulingBooking } = useUsersMutations();

  const [weekOffset, setWeekOffset] = useState(() =>
    getWeekOffsetFor(currentDateKey, today),
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(() => {
    const day = buildRescheduleDays({
      today,
      weekOffset: getWeekOffsetFor(currentDateKey, today),
      store,
    }).find(({ key }) => key === currentDateKey);
    return day && !day.isDisabled ? day.key : null;
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(
    () => buildRescheduleDays({ today, weekOffset, store }),
    [today, weekOffset, store],
  );

  // Mesmos serviços da visita e o profissional de agora
  const availabilityParams = {
    date: selectedDateKey ?? undefined,
    serviceIds: visit.serviceIds,
    memberId: appointment.storeMember?.id,
  };
  const { slots, isLoadingSlots, isSlotsError } = useAvailabilityQuery({
    storeId: store.id,
    ...availabilityParams,
  });

  // O horário de agora não conta como opção nova
  const times = useMemo(
    () =>
      (slots ?? [])
        .filter(({ available }) => available)
        .map(({ time }) => time)
        .filter(
          (time) =>
            !(selectedDateKey === currentDateKey && time === visit.startTime),
        ),
    [slots, selectedDateKey, currentDateKey, visit.startTime],
  );

  const handleSelectDay = useCallback((day: TRescheduleDay) => {
    if (day.isDisabled) return;
    setSelectedDateKey(day.key);
    setSelectedTime(null);
    setError(null);
  }, []);

  const handleSelectTime = useCallback((time: string) => {
    setSelectedTime(time);
    setError(null);
  }, []);

  const handlePrevWeek = useCallback(() => {
    setWeekOffset((offset) => Math.max(0, offset - 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekOffset((offset) => offset + 1);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedDateKey || !selectedTime) return;

    rescheduleBooking(
      {
        appointment,
        request: { date: selectedDateKey, startTime: selectedTime },
      },
      {
        onSuccess: () => onClose(),
        onError: (mutationError) => {
          const policyMessage = getPolicyBlockMessage(mutationError);
          if (policyMessage) {
            onPolicyBlocked(policyMessage);
            return;
          }

          if (isApiHttpError(mutationError) && mutationError.status === 409) {
            setError(SLOT_TAKEN_MESSAGE);
            setSelectedTime(null);
            getQueryClient().invalidateQueries({
              queryKey: CACHE_QUERY_KEYS.availability(store.id, {
                date: selectedDateKey,
                serviceIds: visit.serviceIds,
                memberId: appointment.storeMember?.id,
              }),
            });
            return;
          }

          toast.error('Não foi possível remarcar o agendamento');
        },
      },
    );
  }, [
    appointment,
    onClose,
    onPolicyBlocked,
    rescheduleBooking,
    selectedDateKey,
    selectedTime,
    store.id,
    visit.serviceIds,
  ]);

  return {
    storeName: store.name,
    serviceLine: `${visit.serviceNames} · ${getProfessionalName(appointment)}`,
    currentTimeLine: formatCurrentVisitTime(visit),
    days,
    selectedDateKey,
    times,
    selectedTime,
    error,
    isLoadingSlots: !!selectedDateKey && isLoadingSlots,
    isSlotsError,
    canGoBack: weekOffset > 0,
    canGoForward: hasNextWeek(weekOffset, store),
    canConfirm: !!selectedDateKey && !!selectedTime && !isReschedulingBooking,
    isReschedulingBooking,
    handleSelectDay,
    handleSelectTime,
    handlePrevWeek,
    handleNextWeek,
    handleConfirm,
  };
};
