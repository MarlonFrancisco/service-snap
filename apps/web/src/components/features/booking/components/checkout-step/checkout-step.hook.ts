'use client';

import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { isApiHttpError } from '@/service/api';
import { ScheduleService } from '@/service/partner/schedule';
import { useAuthStore } from '@/store/auth/auth.store';
import { IAppointment, ICreateAppointment } from '@/types/api/schedule.types';
import { IUser } from '@/types/api/users.types';
import { cookies } from '@/utils/helpers/cookie.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import {
  buildBookingConfirmation,
  buildSchedulePayload,
  getBookingTotals,
  getInitials,
} from '../../booking.helpers';
import { useGetStore } from '../../booking.hook';
import { TBookingFormData } from '../../booking.schema';
import type { TCheckoutStepConfig } from './checkout-step.types';

const SLOT_TAKEN_MESSAGE =
  'Este horário acabou de ser ocupado. Volte e escolha outro horário.';

export const useCheckoutStep = ({ onConfirmed }: TCheckoutStepConfig) => {
  const store = useGetStore()!;
  const { user, isLoggedIn } = useUserQuery();
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const form = useFormContext<TBookingFormData>();
  const analytics = useAnalytics();

  // A tela de confirmação já é o retorno do sucesso: sem toast aqui
  const { mutate: createSchedule, isPending: isCreatingSchedule } = useMutation(
    {
      mutationFn: (schedule: Partial<ICreateAppointment>) =>
        ScheduleService.create(store.id, schedule),
      onError: (error) => {
        toast.error(
          isApiHttpError(error) && error.status === 409
            ? SLOT_TAKEN_MESSAGE
            : 'Erro ao criar agendamento',
        );
      },
    },
  );

  const getBookingSummary = useCallback(
    (services: TBookingFormData['selectedServices']) => ({
      store_id: store.id,
      service_ids: services.map((service) => service.id),
      value: getBookingTotals(services).totalPrice,
      currency: store.currency,
    }),
    [store.id, store.currency],
  );

  const handleLoginClick = useCallback(() => {
    openAuthAction({ source: 'checkout' });
  }, [openAuthAction]);

  const handleSchedule = () => {
    analytics.track(
      'booking_confirm_clicked',
      getBookingSummary(form.getValues('selectedServices')),
    );

    form.handleSubmit(
      (data) => {
        const startTime = data.selectedTime!;
        const date = data.selectedDate!;

        // Em "Qualquer profissional", quem atende vem do horário escolhido
        const professionalId = data.isAnyProfessional
          ? data.assignedProfessionalId
          : data.selectedProfessional?.id;

        if (!professionalId) {
          analytics.track('booking_failed', {
            store_id: store.id,
            reason: 'no_professional',
          });
          toast.error(
            'Nenhum profissional está disponível neste horário. Volte e escolha outro horário.',
          );
          return;
        }

        const summary = getBookingSummary(data.selectedServices);
        const chosenProfessional = data.selectedProfessional?.user;

        createSchedule(
          {
            user,
            ...buildSchedulePayload({
              services: data.selectedServices,
              date,
              startTime,
              professionalId,
            }),
          } as Partial<ICreateAppointment>,
          {
            onSuccess: (appointments: IAppointment[]) => {
              analytics.track('booking_completed', {
                ...summary,
                appointment_ids: appointments.map(({ id }) => id),
                professional_id: professionalId,
              });

              // O perfil já abre com a reserva nova
              getQueryClient().setQueryData(
                CACHE_QUERY_KEYS.user(cookies.get('user_identification')!),
                (old: IUser | undefined) =>
                  old && {
                    ...old,
                    schedules: [
                      ...(old.schedules ?? []),
                      ...appointments.map((appointment) => ({
                        ...appointment,
                        store,
                      })),
                    ],
                  },
              );

              onConfirmed(
                buildBookingConfirmation({
                  appointments,
                  services: data.selectedServices,
                  date,
                  fallbackProfessionalName: chosenProfessional
                    ? `${chosenProfessional.firstName} ${chosenProfessional.lastName}`
                    : 'Qualquer profissional',
                }),
              );
            },
            onError: (error) => {
              const httpStatus = isApiHttpError(error)
                ? error.status
                : undefined;
              analytics.track('booking_failed', {
                store_id: store.id,
                reason: httpStatus === 409 ? 'slot_taken' : 'api_error',
                http_status: httpStatus,
              });
            },
          },
        );
      },
      (errors) => {
        analytics.track('booking_failed', {
          store_id: store.id,
          reason: 'validation',
        });
        const firstError = Object.values(errors)[0]?.message;
        if (firstError) {
          toast.error(firstError);
        }
      },
    )();
  };

  return {
    user,
    isLoggedIn,
    initials: getInitials(user?.firstName, user?.lastName),
    contactLine: [user?.email, user?.telephone].filter(Boolean).join(' · '),
    isCreatingSchedule,
    handleSchedule,
    handleLoginClick,
  };
};
