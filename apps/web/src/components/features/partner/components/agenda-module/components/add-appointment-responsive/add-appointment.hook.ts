import { ScheduleService } from '@/service/partner/schedule';
import { usePartnerStore } from '@/store';
import { useAgendaStore } from '@/store/admin/agenda';
import { IAppointment, ICreateAppointment } from '@/types/api/schedule.types';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { addMinutesToTime } from './add-appointment.helpers';
import {
  addAppointmentSchema,
  TAddAppointmentSchema,
} from './add-appointment.schema';

export const useAddAppointmentMutations = () => {
  const setIsAddAppointmentOpen = useAgendaStore(
    (state) => state.setIsAddAppointmentOpen,
  );
  const storeId = usePartnerStore.getState().activeStore.id;
  const queryClient = getQueryClient();

  const { mutate: createAppointment, isPending: isCreatingAppointment } =
    useMutation({
      mutationFn: (data: Partial<ICreateAppointment>) => {
        return ScheduleService.create(storeId, data);
      },
      onSuccess: (data: IAppointment[]) => {
        queryClient.setQueryData(
          CACHE_QUERY_KEYS.schedules(storeId),
          (old: IAppointment[]) => [...old, ...data],
        );
        toast.success('Agendamento criado com sucesso');
        setIsAddAppointmentOpen({ isAddAppointmentOpen: false });
      },
      onError: () => {
        toast.error('Erro ao criar agendamento');
      },
    });

  return {
    createAppointment,
    isCreatingAppointment,
  };
};

export const useAddAppointment = () => {
  const form = useForm<TAddAppointmentSchema>({
    resolver: zodResolver(addAppointmentSchema),
  });

  const isAddAppointmentOpen = useAgendaStore(
    (state) => state.isAddAppointmentOpen,
  );
  const selectedAppointment = useAgendaStore(
    (state) => state.selectedAppointment,
  );
  const setIsAddAppointmentOpen = useAgendaStore(
    (state) => state.setIsAddAppointmentOpen,
  );

  const professionals = usePartnerStore(
    (state) => state.activeStore.storeMembers || [],
  );
  const services = usePartnerStore((state) => state.activeStore.services || []);

  const { createAppointment, isCreatingAppointment } =
    useAddAppointmentMutations();

  useEffect(() => {
    if (selectedAppointment) {
      form.reset(selectedAppointment);
    }
  }, [selectedAppointment, form]);

  const handleClose = () => {
    setIsAddAppointmentOpen({ isAddAppointmentOpen: false });
    form.reset();
  };

  const handleSubmit = () => {
    form.handleSubmit(
      (data) => {
        createAppointment({
          ...data,
          endTime: addMinutesToTime(data.startTime, data.service.duration),
          date: new Date(data.date).toISOString().split('T')[0],
          status: 'scheduled',
          services: [{ id: data.service.id, duration: data.service.duration }],
        });
      },
      (errors) => {
        const firstError = Object.values(errors)[0]?.message;
        if (firstError) {
          toast.error(firstError);
        }
      },
    )();
  };

  return {
    form,
    professionals,
    services,
    isOpen: isAddAppointmentOpen,
    isCreatingAppointment,
    handleSubmit,
    handleClose,
  };
};
