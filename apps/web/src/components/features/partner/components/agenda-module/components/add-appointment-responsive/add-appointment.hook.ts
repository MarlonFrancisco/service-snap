import { useAnalytics } from '@/providers/analytics.provider';
import { isApiHttpError } from '@/service/api';
import { ScheduleService } from '@/service/partner/schedule';
import { usePartnerStore } from '@/store';
import { selectTimeSlots, useAgendaStore } from '@/store/admin/agenda';
import { IAppointment, ICreateAppointment } from '@/types/api/schedule.types';
import type { IService } from '@/types/api/service.types';
import type { IProfessional } from '@/types/api/users.types';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { addMinutesToTime } from './add-appointment.helpers';
import {
  ADD_APPOINTMENT_EMPTY_VALUES,
  addAppointmentSchema,
  TAddAppointmentSchema,
} from './add-appointment.schema';

const EMPTY_PROFESSIONALS: IProfessional[] = [];
const EMPTY_SERVICES: IService[] = [];

export const useAddAppointmentMutations = () => {
  const analytics = useAnalytics();
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
          (old: IAppointment[] | undefined) => [...(old ?? []), ...data],
        );
        analytics.track('appointment_created', {
          store_id: storeId,
          service_ids: data.map((appointment) => appointment.service?.id),
          value: data.reduce(
            (total, appointment) => total + (appointment.service?.price ?? 0),
            0,
          ),
          source: 'partner',
        });
        toast.success('Agendamento criado com sucesso');
        setIsAddAppointmentOpen({ isAddAppointmentOpen: false });
      },
      onError: (error) => {
        const httpStatus = isApiHttpError(error) ? error.status : undefined;
        analytics.track('appointment_create_failed', {
          store_id: storeId,
          reason: httpStatus === 409 ? 'conflict' : 'other',
          http_status: httpStatus,
        });
        toast.error(
          isApiHttpError(error) && error.status === 409
            ? 'Este profissional já tem um agendamento neste horário'
            : 'Erro ao criar agendamento',
        );
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
    defaultValues: ADD_APPOINTMENT_EMPTY_VALUES,
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
    (state) => state.activeStore.storeMembers ?? EMPTY_PROFESSIONALS,
  );
  const services = usePartnerStore(
    (state) => state.activeStore.services ?? EMPTY_SERVICES,
  );
  const timeSlots = usePartnerStore(selectTimeSlots);

  const { createAppointment, isCreatingAppointment } =
    useAddAppointmentMutations();

  // Cada abertura parte do slot clicado ou de um formulário vazio.
  useEffect(() => {
    if (isAddAppointmentOpen) {
      form.reset(selectedAppointment ?? ADD_APPOINTMENT_EMPTY_VALUES);
    }
  }, [isAddAppointmentOpen, selectedAppointment, form]);

  const handleClose = () => {
    setIsAddAppointmentOpen({ isAddAppointmentOpen: false });
  };

  const handleServiceChange = useCallback(
    (serviceId: string) => {
      const service = services.find((item) => item.id === serviceId);

      if (service) {
        // `formState.isSubmitted` não é lido na renderização, então fica
        // desatualizado aqui e o erro do envio anterior nunca saía.
        form.setValue('service', service, { shouldValidate: true });
      }
    },
    [services, form],
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
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
    )(event);
  };

  return {
    form,
    professionals,
    services,
    timeSlots,
    isOpen: isAddAppointmentOpen,
    isCreatingAppointment,
    handleSubmit,
    handleClose,
    handleServiceChange,
  };
};
