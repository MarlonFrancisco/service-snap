import { AuthService } from '@/service/auth';
import { ScheduleService } from '@/service/partner/schedule';
import { UsersService } from '@/service/users';
import { IUser } from '@/types/api';
import type {
  IAppointment,
  TRescheduleRequest,
} from '@/types/api/schedule.types';
import { cookies } from '@/utils/helpers/cookie.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const getUserQueryKey = () =>
  CACHE_QUERY_KEYS.user(cookies.get('user_identification')!);

export const useUsersMutations = () => {
  const queryClient = getQueryClient();

  const mergeUser = (data: Partial<IUser>) =>
    queryClient.setQueryData(getUserQueryKey(), (old: IUser | undefined) =>
      old ? { ...old, ...data } : old,
    );

  const { mutate: updateAvatar, isPending: isUpdatingAvatar } = useMutation({
    mutationFn: (avatar: string) => UsersService.updateAvatar(avatar),
    onSuccess: (data) => {
      mergeUser(data);
      toast.success('Avatar atualizado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar avatar');
    },
  });

  const { mutate: deleteUser, isPending: isDeletingUser } = useMutation({
    mutationFn: () => UsersService.delete(),
    onSuccess: (user: { id: string }) => {
      queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.user(user.id),
      });
      toast.success('Conta excluída com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir conta');
    },
  });

  // Só o nome: o resto do usuário (agendamentos, favoritos) fica como está
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: (profile: { firstName: string; lastName: string }) =>
      UsersService.updateProfile(profile),
    onSuccess: ({ firstName, lastName }) => {
      mergeUser({ firstName, lastName });
      toast.success('Dados salvos');
    },
    onError: () => {
      toast.error('Não foi possível salvar seus dados');
    },
  });

  // Erros (409, 429, 503) ficam com a tela, que mostra a mensagem no lugar
  const { mutate: requestEmailChange, isPending: isRequestingEmailChange } =
    useMutation({
      mutationFn: (email: string) => AuthService.requestEmailChange(email),
    });

  const { mutate: confirmEmailChange, isPending: isConfirmingEmailChange } =
    useMutation({
      mutationFn: (code: string) => AuthService.confirmEmailChange(code),
      onSuccess: ({ user }) => {
        mergeUser({ email: user.email });
        queryClient.invalidateQueries({ queryKey: getUserQueryKey() });
        toast.success('E-mail alterado');
      },
    });

  /** Remarca a visita inteira; o 403 da política e o 409 ficam com a tela. */
  const { mutate: rescheduleBooking, isPending: isReschedulingBooking } =
    useMutation({
      mutationFn: ({
        appointment,
        request,
      }: {
        appointment: IAppointment;
        request: TRescheduleRequest;
      }) =>
        ScheduleService.reschedule(
          appointment.store.id,
          appointment.id,
          request,
        ),
      onSuccess: (_, { appointment }) => {
        queryClient.invalidateQueries({ queryKey: getUserQueryKey() });
        queryClient.invalidateQueries({
          queryKey: CACHE_QUERY_KEYS.schedules(appointment.store.id),
        });
        toast.success('Agendamento remarcado');
      },
    });

  /** Cancela a visita inteira; o 403 da política fica com a tela. */
  const { mutate: cancelBooking, isPending: isCancelingBooking } = useMutation({
    mutationFn: (appointment: IAppointment) =>
      ScheduleService.delete(appointment.store.id, appointment.id),
    onSuccess: (_, appointment) => {
      queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.schedules(appointment.store.id),
      });
      // A API cancela (status `cancelled`), não apaga o agendamento
      toast.success('Agendamento cancelado');
    },
  });

  return {
    updateAvatar,
    isUpdatingAvatar,

    deleteUser,
    isDeletingUser,

    updateProfile,
    isUpdatingProfile,

    requestEmailChange,
    isRequestingEmailChange,

    confirmEmailChange,
    isConfirmingEmailChange,

    rescheduleBooking,
    isReschedulingBooking,

    cancelBooking,
    isCancelingBooking,
  };
};
