import { isApiHttpError } from '@/service/api';
import { ScheduleService } from '@/service/partner/schedule/schedule.service';
import { IAppointment, ICreateAppointment } from '@/types/api/schedule.types';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { moveVisitInList } from './use-schedule-mutations.helpers';
import type { TRescheduleVariables } from './use-schedule-mutations.types';

const getRescheduleErrorMessage = (error: unknown): string => {
  if (!isApiHttpError(error)) return 'Não foi possível remarcar o agendamento';
  if (error.status === 409) {
    return 'Este horário já está ocupado. Escolha outro horário.';
  }
  if (
    error.status === 400 &&
    JSON.stringify(error.body).includes('does not perform')
  ) {
    return 'Este profissional não faz todos os serviços da visita';
  }
  if (error.status === 403) {
    return 'Você não tem permissão para remarcar este agendamento';
  }
  return 'Não foi possível remarcar o agendamento';
};

export const useScheduleMutations = ({ storeId }: { storeId: string }) => {
  const queryClient = getQueryClient();

  // Cada período da agenda é uma consulta: o prefixo recarrega todas.
  const invalidateSchedules = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.schedules(storeId),
      }),
    [queryClient, storeId],
  );

  const { mutate: createSchedule, isPending: isCreatingSchedule } = useMutation(
    {
      mutationFn: (schedule: Partial<ICreateAppointment>) =>
        ScheduleService.create(schedule.store?.id || storeId, schedule),
      onSuccess: () => {
        invalidateSchedules();
        toast.success('Agendamento criado com sucesso');
      },
      onError: (error) => {
        toast.error(
          isApiHttpError(error) && error.status === 409
            ? 'Este horário acabou de ser ocupado. Volte e escolha outro horário.'
            : 'Erro ao criar agendamento',
        );
      },
    },
  );

  const { mutate: deleteSchedule, isPending: isDeletingSchedule } = useMutation(
    {
      mutationFn: (schedule: IAppointment) =>
        ScheduleService.delete(schedule.store?.id || storeId, schedule.id),
      onSuccess: () => {
        invalidateSchedules();
        // A API cancela (status `cancelled`), não apaga o agendamento
        toast.success('Agendamento cancelado');
      },
      onError: () => {
        toast.error('Não foi possível cancelar o agendamento');
      },
    },
  );

  /**
   * Move a visita inteira. A grade já mostra o bloco no destino enquanto a
   * API responde; se ela recusar, a consulta recarrega o período.
   */
  const {
    mutate: rescheduleSchedule,
    mutateAsync: rescheduleScheduleAsync,
    isPending: isReschedulingSchedule,
  } = useMutation({
    mutationFn: ({ visit, request }: TRescheduleVariables) =>
      ScheduleService.reschedule(storeId, visit.id, request),
    onMutate: async ({ visit, request, professional }) => {
      await queryClient.cancelQueries({
        queryKey: CACHE_QUERY_KEYS.schedules(storeId),
      });
      queryClient.setQueriesData<IAppointment[]>(
        { queryKey: CACHE_QUERY_KEYS.schedules(storeId) },
        (old) =>
          old ? moveVisitInList(old, visit, request, professional) : old,
      );
    },
    onSuccess: () => {
      toast.success('Agendamento remarcado. Avisamos o cliente por e-mail.');
    },
    onError: (error) => {
      toast.error(getRescheduleErrorMessage(error));
    },
    onSettled: () => {
      invalidateSchedules();
    },
  });

  return {
    createSchedule,
    isCreatingSchedule,
    deleteSchedule,
    isDeletingSchedule,
    rescheduleSchedule,
    rescheduleScheduleAsync,
    isReschedulingSchedule,
    invalidateSchedules,
  };
};
