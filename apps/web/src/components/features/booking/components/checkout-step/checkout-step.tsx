'use client';

import { useScheduleMutations } from '@/hooks';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { isApiHttpError } from '@/service/api';
import { useAuthStore } from '@/store/auth/auth.store';
import { IAppointment, ICreateAppointment } from '@/types/api/schedule.types';
import { IUser } from '@/types/api/users.types';
import { cookies } from '@/utils/helpers/cookie.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import {
  buildSchedulePayload,
  getBookingTotals,
  getInitials,
} from '../../booking.helpers';
import { useGetStore } from '../../booking.hook';
import { TBookingFormData } from '../../booking.schema';

const SUBTITLE_CLASS = 'mt-1.5 mb-6 text-[15px] text-[#5F5C6E]';
const NOTICE_CLASS =
  'mt-5 rounded-[14px] bg-[#F7F6FA] px-[18px] py-4 text-sm leading-[1.5] text-[#0B0B0F]';
const PRIMARY_BUTTON_CLASS =
  'mt-6 flex h-14 w-full max-w-[420px] items-center justify-center gap-2 rounded-full bg-[#0B0B0F] text-[15px] font-bold text-white transition-colors hover:bg-[#2B2B2B] disabled:cursor-not-allowed disabled:opacity-60';

export function CheckoutStep() {
  const store = useGetStore();
  const router = useRouter();
  const { user, isLoggedIn } = useUserQuery();
  const { createSchedule, isCreatingSchedule } = useScheduleMutations({
    storeId: store!.id,
  });
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const form = useFormContext<TBookingFormData>();
  const analytics = useAnalytics();

  const getBookingSummary = (services: TBookingFormData['selectedServices']) => ({
    store_id: store!.id,
    service_ids: services.map((service) => service.id),
    value: getBookingTotals(services).totalPrice,
    currency: store!.currency,
  });

  const handleLoginClick = () => {
    openAuthAction({ source: 'checkout' });
  };

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
            store_id: store!.id,
            reason: 'no_professional',
          });
          toast.error(
            'Nenhum profissional está disponível neste horário. Volte e escolha outro horário.',
          );
          return;
        }

        const summary = getBookingSummary(data.selectedServices);

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
            onSuccess: (data: IAppointment[]) => {
              analytics.track('booking_completed', {
                ...summary,
                appointment_ids: data.map((appointment) => appointment.id),
                professional_id: professionalId,
              });

              const queryClient = getQueryClient();
              queryClient.setQueryData(
                CACHE_QUERY_KEYS.user(cookies.get('user_identification')!),
                (old: IUser) => ({
                  ...old,
                  schedules: [
                    ...old.schedules,
                    ...data.map((d) => ({
                      ...d,
                      store: store!,
                    })),
                  ],
                }),
              );

              router.push('/profile');
            },
            onError: (error) => {
              const httpStatus = isApiHttpError(error)
                ? error.status
                : undefined;
              analytics.track('booking_failed', {
                store_id: store!.id,
                reason: httpStatus === 409 ? 'slot_taken' : 'api_error',
                http_status: httpStatus,
              });
            },
          },
        );
      },
      (errors) => {
        analytics.track('booking_failed', {
          store_id: store!.id,
          reason: 'validation',
        });
        const firstError = Object.values(errors)[0]?.message;
        if (firstError) {
          toast.error(firstError);
        }
      },
    )();
  };

  return (
    <div>
      <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#0B0B0F]">
        Finalize seu agendamento
      </h1>

      {isLoggedIn ? (
        <>
          <p className={SUBTITLE_CLASS}>
            Confira seus dados e confirme a reserva
          </p>

          <div className="flex items-center gap-4 rounded-[22px] border border-[#E3E1EA] p-5">
            <span
              aria-hidden
              className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-[#0B0B0F] text-[15px] font-bold text-white"
            >
              {getInitials(user?.firstName, user?.lastName)}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#0B0B0F]">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="mt-[3px] text-sm break-words text-[#5F5C6E]">
                {[user?.email, user?.telephone].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>

          <p className={NOTICE_CLASS}>
            O pagamento é feito no local, direto com o estabelecimento.
          </p>

          <button
            type="button"
            onClick={handleSchedule}
            disabled={isCreatingSchedule}
            className={PRIMARY_BUTTON_CLASS}
          >
            {isCreatingSchedule ? 'Confirmando...' : 'Confirmar agendamento'}
            {isCreatingSchedule && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
          </button>

          <p className="mt-3 max-w-[420px] text-[13px] leading-[1.5] text-[#5F5C6E]">
            Ao confirmar, você concorda com nossos{' '}
            <a href="/terms" className="underline hover:text-[#0B0B0F]">
              termos de serviço
            </a>{' '}
            e{' '}
            <a href="/privacy" className="underline hover:text-[#0B0B0F]">
              política de privacidade
            </a>
            .
          </p>
        </>
      ) : (
        <>
          <p className={SUBTITLE_CLASS}>
            Entre na sua conta para confirmar a reserva
          </p>

          <p className={NOTICE_CLASS}>
            Sua seleção fica salva. Depois do login, você volta para esta etapa.
          </p>

          <button
            type="button"
            onClick={handleLoginClick}
            className={PRIMARY_BUTTON_CLASS}
          >
            Fazer login para confirmar
          </button>
        </>
      )}
    </div>
  );
}
