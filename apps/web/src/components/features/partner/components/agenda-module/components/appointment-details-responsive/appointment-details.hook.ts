import { useAnalytics } from '@/providers/analytics.provider';
import { ScheduleService } from '@/service/partner/schedule';
import { usePartnerStore } from '@/store';
import { useAgendaStore } from '@/store/admin/agenda';
import { IAppointment, TAppointmentStatus } from '@/types/api/schedule.types';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { STATUS_CONFIG } from '../agenda-grid/agenda-grid.constants';

const calculateDuration = (startTime: string, endTime: string): string => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  // Minuto 0 é válido: `!startMin` tratava todo horário `:00` como ausente.
  if (
    startHour === undefined ||
    startMin === undefined ||
    endHour === undefined ||
    endMin === undefined ||
    [startHour, startMin, endHour, endMin].some(Number.isNaN)
  ) {
    return 'erro ao calcular duração';
  }

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const duration = endMinutes - startMinutes;

  if (duration >= 60) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }

  return `${duration}min`;
};

/** Horas entre agora e o início do agendamento (negativo se já passou). */
const getHoursBeforeStart = (date: string, startTime: string): number => {
  const start = new Date(`${date.split('T')[0]}T${startTime}`).getTime();
  return Number.isNaN(start)
    ? 0
    : Math.round((start - Date.now()) / (60 * 60 * 1000));
};

/**
 * Formata a data textualmente: `new Date('YYYY-MM-DD')` é meia-noite em UTC e
 * exibiria o dia anterior no fuso do Brasil.
 */
const formatAppointmentDate = (date: string): string => {
  const [year, month, day] = date.split('T')[0]?.split('-') ?? [];
  return year && month && day ? `${day}/${month}/${year}` : '';
};

// Mutations hook
export const useAppointmentDetailsMutations = () => {
  const analytics = useAnalytics();
  const storeId = usePartnerStore.getState().activeStore.id;
  const setDetailsAppointment = useAgendaStore(
    (state) => state.setDetailsAppointment,
  );
  const queryClient = getQueryClient();

  const { mutate: updateAppointmentStatus, isPending: isUpdatingStatus } =
    useMutation({
      mutationFn: ({
        scheduleId,
        status,
      }: {
        scheduleId: string;
        status: TAppointmentStatus;
        previousStatus?: TAppointmentStatus;
        date?: string;
        startTime?: string;
      }) => {
        return ScheduleService.update(storeId, scheduleId, { status });
      },
      onSuccess: (data, variables) => {
        const previousStatus = variables.previousStatus ?? 'scheduled';

        if (variables.status !== previousStatus) {
          if (variables.status === 'completed') {
            analytics.track('appointment_completed', {
              appointment_id: variables.scheduleId,
              store_id: storeId,
              previous_status: previousStatus,
            });
          } else if (variables.status === 'no-show') {
            analytics.track('appointment_no_show', {
              appointment_id: variables.scheduleId,
              store_id: storeId,
              previous_status: previousStatus,
            });
          } else if (variables.status === 'cancelled') {
            analytics.track('appointment_cancelled', {
              appointment_id: variables.scheduleId,
              store_id: storeId,
              source: 'partner',
              hours_before:
                variables.date && variables.startTime
                  ? getHoursBeforeStart(variables.date, variables.startTime)
                  : undefined,
            });
          }
        }

        // Update cache with optimistic update
        queryClient.setQueryData(
          CACHE_QUERY_KEYS.schedules(storeId),
          (old: IAppointment[] | undefined) => {
            if (!old) return [data];
            const newAppointments = old.map((appointment) =>
              appointment.id === data.id
                ? { ...appointment, ...data }
                : appointment,
            );

            return newAppointments;
          },
        );

        // Show success message based on status
        const statusMessages = {
          completed: 'Agendamento marcado como concluído',
          cancelled: 'Agendamento cancelado',
          'no-show': 'Cliente marcado como não compareceu',
          scheduled: 'Agendamento atualizado',
        };
        toast.success(statusMessages[data.status] || 'Status atualizado');

        // Close the details modal
        setDetailsAppointment();
      },
      onError: (_error, variables) => {
        analytics.track('appointment_status_update_failed', {
          status: variables.status,
        });
        toast.error('Erro ao atualizar status do agendamento');
      },
    });

  return {
    updateAppointmentStatus,
    isUpdatingStatus,
  };
};

// Main hook
export const useAppointmentDetails = () => {
  const detailsAppointment = useAgendaStore(
    (state) => state.detailsAppointment,
  );
  const setDetailsAppointment = useAgendaStore(
    (state) => state.setDetailsAppointment,
  );

  const { updateAppointmentStatus, isUpdatingStatus } =
    useAppointmentDetailsMutations();

  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const cancelTriggerRef = useRef<HTMLButtonElement>(null);

  const isOpen = !!detailsAppointment?.id;

  // Reabrir outro agendamento não pode herdar a confirmação do anterior.
  useEffect(() => {
    setIsConfirmingCancel(false);
  }, [detailsAppointment?.id]);

  const statusBadge = STATUS_CONFIG[detailsAppointment.status];

  const duration = useMemo(
    () =>
      detailsAppointment?.startTime && detailsAppointment?.endTime
        ? calculateDuration(
            detailsAppointment.startTime,
            detailsAppointment.endTime,
          )
        : '',
    [detailsAppointment?.startTime, detailsAppointment?.endTime],
  );

  const formattedDate = useMemo(
    () => formatAppointmentDate(detailsAppointment.date),
    [detailsAppointment.date],
  );

  const handleClose = useCallback(() => {
    setDetailsAppointment();
  }, [setDetailsAppointment]);

  const handleStatusChange = useCallback(
    (id: string, status: TAppointmentStatus) => {
      updateAppointmentStatus({
        scheduleId: id,
        status,
        previousStatus: detailsAppointment.status,
        date: detailsAppointment.date,
        startTime: detailsAppointment.startTime,
      });
    },
    [
      updateAppointmentStatus,
      detailsAppointment.status,
      detailsAppointment.date,
      detailsAppointment.startTime,
    ],
  );

  const handleRequestCancel = useCallback(() => {
    setIsConfirmingCancel(true);
  }, []);

  const handleDismissCancel = useCallback(() => {
    setIsConfirmingCancel(false);
    // O botão só volta ao DOM no próximo render; o foco não pode se perder no Dialog.
    requestAnimationFrame(() => cancelTriggerRef.current?.focus());
  }, []);

  return {
    detailsAppointment,
    isOpen,
    statusBadge,
    duration,
    formattedDate,
    isUpdatingStatus,
    isConfirmingCancel,
    cancelTriggerRef,
    handleClose,
    handleStatusChange,
    handleRequestCancel,
    handleDismissCancel,
  };
};
