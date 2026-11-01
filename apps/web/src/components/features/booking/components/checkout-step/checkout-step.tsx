'use client';

import { useScheduleMutations } from '@/hooks';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAuthStore } from '@/store/auth/auth.store';
import { IAppointment } from '@/types/api/schedule.types';
import { IProfessional, IUser } from '@/types/api/users.types';
import { cookies } from '@/utils/helpers/cookie.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { Button } from '@repo/ui';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LogIn,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { useGetStore } from '../../booking.hook';
import { TBookingFormData } from '../../booking.schema';

export function CheckoutStep() {
  const store = useGetStore();
  const router = useRouter();
  const { user, isLoggedIn } = useUserQuery();
  const { createSchedule, isCreatingSchedule } = useScheduleMutations({
    storeId: store!.id,
  });
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const form = useFormContext<TBookingFormData>();

  const handleLoginClick = () => {
    openAuthAction();
  };

  const handleSchedule = () => {
    form.handleSubmit(
      (data) => {
        createSchedule(
          {
            user,
            startTime: data.selectedTime!,
            endTime: data.selectedTime!,
            date: data.selectedDate!.toISOString().split('T')[0],
            services: data.selectedServices.map((service) => ({
              id: service.id,
              duration: service.duration,
            })),
            storeMember: { id: data.selectedProfessional!.id } as IProfessional,
          },
          {
            onSuccess: (data: IAppointment[]) => {
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
          },
        );
      },
      (errors) => {
        const firstError = Object.values(errors)[0]?.message;
        if (firstError) {
          toast.error(firstError);
        }
      },
    )();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-2xl text-[#0A0A0A] mb-1">
          Finalize seu agendamento
        </h2>
        <p className="text-sm sm:text-base text-[#2B2B2B]">
          Informe seus dados para confirmar a reserva
        </p>
      </div>

      {/* Dados do Cliente */}
      {isLoggedIn ? (
        /* Estado Logado - Confirmação */
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E4E4E7] bg-[#F4F4F5] p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#047857]">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#0A0A0A] mb-1">Você está autenticado</h3>
                <p className="text-sm text-[#2B2B2B] mb-4">
                  Suas informações estão prontas para o agendamento
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#71717A]" />
                    <span className="text-[#0A0A0A]">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#71717A]" />
                    <span className="text-[#0A0A0A]">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Phone className="h-4 w-4 text-[#71717A]" />
                    <span className="text-[#0A0A0A]">{user?.telephone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Estado Não Logado - Formulário Clean */
        <div className="space-y-6">{/* Opção de Login - Discreto */}</div>
      )}

      {/* CTA Final - Mais destacado */}
      <div className="space-y-3 pt-2">
        {isLoggedIn ? (
          <>
            <Button
              onClick={handleSchedule}
              className="h-14 w-full rounded-2xl bg-[#0A0A0A] text-white hover:bg-[#2B2B2B]"
              disabled={isCreatingSchedule}
            >
              <div className="flex items-center justify-center gap-2">
                <span>
                  {isCreatingSchedule
                    ? 'Confirmando...'
                    : 'Confirmar Agendamento'}
                </span>
                {isCreatingSchedule ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight />
                )}
              </div>
            </Button>

            <p className="text-xs text-center text-[#71717A] leading-relaxed">
              Ao confirmar, você concorda com nossos{' '}
              <a href="/terms" className="underline hover:text-[#2B2B2B]">
                termos de serviço
              </a>{' '}
              e{' '}
              <a href="/privacy" className="underline hover:text-[#2B2B2B]">
                política de cancelamento
              </a>
            </p>
          </>
        ) : (
          <Button
            onClick={handleLoginClick}
            className="h-14 w-full rounded-2xl bg-[#0A0A0A] text-white hover:bg-[#2B2B2B]"
          >
            <div className="flex items-center justify-center gap-2">
              <span>Fazer login para confirmar</span>
              <LogIn />
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
