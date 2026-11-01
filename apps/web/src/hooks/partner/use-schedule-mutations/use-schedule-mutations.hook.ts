import { isApiHttpError } from '@/service/api';
import { ScheduleService } from '@/service/partner/schedule/schedule.service';
import { IAppointment, ICreateAppointment } from '@/types/api/schedule.types';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useScheduleMutations = ({ storeId }: { storeId: string }) => {
  const { mutate: createSchedule, isPending: isCreatingSchedule } = useMutation(
    {
      mutationFn: (schedule: Partial<ICreateAppointment>) =>
        ScheduleService.create(schedule.store?.id || storeId, schedule),
      onSuccess: () => {
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
        ScheduleService.delete(schedule.store.id || storeId, schedule.id),
      onSuccess: () => {
        toast.success('Agendamento deletado com sucesso');
      },
      onError: () => {
        toast.error('Erro ao deletar agendamento');
      },
    },
  );

  return {
    createSchedule,
    isCreatingSchedule,
    deleteSchedule,
    isDeletingSchedule,
  };
};
