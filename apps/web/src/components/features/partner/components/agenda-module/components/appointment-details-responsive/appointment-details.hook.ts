import { useScheduleSeriesByScheduleQuery } from '@/hooks/partner/use-schedule-series-by-schedule-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { ScheduleService } from '@/service/partner/schedule';
import { usePartnerStore } from '@/store';
import { useAgendaStore } from '@/store/admin/agenda';
import { TAppointmentStatus } from '@/types/api/schedule.types';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { STATUS_CONFIG } from '../agenda-grid/agenda-grid.constants';
import { getVisitItems } from '../agenda-grid/agenda-grid.helpers';

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
      mutationFn: async (variables: {
        scheduleId: string;
        status: TAppointmentStatus;
        previousStatus?: TAppointmentStatus;
        date?: string;
        startTime?: string;
        itemIds?: string[];
      }) => {
        // A visita muda de status inteira: um pedido por serviço dela.
        const ids = variables.itemIds?.length
          ? variables.itemIds
          : [variables.scheduleId];
        const [first] = await Promise.all(
          ids.map((id) =>
            ScheduleService.update(storeId, id, { status: variables.status }),
          ),
        );
        return first!;
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

        // Cada período da agenda é uma consulta: o prefixo recarrega todas.
        queryClient.invalidateQueries({
          queryKey: CACHE_QUERY_KEYS.schedules(storeId),
        });

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
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const cancelTriggerRef = useRef<HTMLButtonElement>(null);

  const isOpen = !!detailsAppointment?.id;

  // Reabrir outro agendamento não pode herdar a confirmação do anterior.
  useEffect(() => {
    setIsConfirmingCancel(false);
    setIsCheckingOut(false);
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
        itemIds: getVisitItems(detailsAppointment).map((item) => item.id),
        previousStatus: detailsAppointment.status,
        date: detailsAppointment.date,
        startTime: detailsAppointment.startTime,
      });
    },
    [updateAppointmentStatus, detailsAppointment],
  );

  const setRescheduleVisit = useAgendaStore(
    (state) => state.setRescheduleVisit,
  );

  const handleOpenReschedule = useCallback(() => {
    setRescheduleVisit(detailsAppointment);
    setDetailsAppointment();
  }, [detailsAppointment, setRescheduleVisit, setDetailsAppointment]);

  const visitItems = useMemo(
    () => getVisitItems(detailsAppointment),
    [detailsAppointment],
  );

  const totalPrice = visitItems.reduce(
    (total, item) => total + (item.service.price ?? 0),
    0,
  );

  const handleRequestCancel = useCallback(() => {
    setIsConfirmingCancel(true);
  }, []);

  const handleDismissCancel = useCallback(() => {
    setIsConfirmingCancel(false);
    // O botão só volta ao DOM no próximo render; o foco não pode se perder no Dialog.
    requestAnimationFrame(() => cancelTriggerRef.current?.focus());
  }, []);

  // Fechar atendimento troca os detalhes pelo formulário, no mesmo diálogo
  const handleOpenCheckout = useCallback(() => setIsCheckingOut(true), []);
  const handleCloseCheckout = useCallback(() => setIsCheckingOut(false), []);
  const handleCheckoutDone = useCallback(() => {
    setIsCheckingOut(false);
    setDetailsAppointment();
  }, [setDetailsAppointment]);

  // Parte de uma série: o cancelamento oferece "este e os próximos"
  const { seriesMembership } = useScheduleSeriesByScheduleQuery({
    storeId: usePartnerStore.getState().activeStore?.id,
    scheduleId: detailsAppointment?.id,
    enabled: isOpen && detailsAppointment?.status === 'scheduled',
  });

  return {
    seriesId: seriesMembership?.id ?? null,
    isCheckingOut,
    handleOpenCheckout,
    handleCloseCheckout,
    handleCheckoutDone,
    detailsAppointment,
    isOpen,
    statusBadge,
    duration,
    formattedDate,
    isUpdatingStatus,
    isConfirmingCancel,
    cancelTriggerRef,
    visitItems,
    totalPrice,
    handleClose,
    handleStatusChange,
    handleOpenReschedule,
    handleRequestCancel,
    handleDismissCancel,
  };
};
