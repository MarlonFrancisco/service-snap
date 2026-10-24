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
              void queryClient.invalidateQueries({
                queryKey: CACHE_QUERY_KEYS.schedulesAvailability(store!.id),
              });

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
        <h2 className="text-lg sm:text-2xl text-[#1a2b4c] mb-1">
          Finalize seu agendamento
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Informe seus dados para confirmar a reserva
        </p>
      </div>

      {/* Dados do Cliente */}
      {isLoggedIn ? (
        /* Estado Logado - Confirmação */
        <div className="space-y-6">
          <div className="bg-green-50 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#1a2b4c] mb-1">Você está autenticado</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Suas informações estão prontas para o agendamento
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900">{user?.telephone}</span>
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
              className="w-full h-14"
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

            <p className="text-xs text-center text-gray-500 leading-relaxed">
              Ao confirmar, você concorda com nossos{' '}
              <a href="/terms" className="underline hover:text-gray-700">
                termos de serviço
              </a>{' '}
              e{' '}
              <a href="/privacy" className="underline hover:text-gray-700">
                política de cancelamento
              </a>
            </p>
          </>
        ) : (
          <Button onClick={handleLoginClick} className="w-full h-14">
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
