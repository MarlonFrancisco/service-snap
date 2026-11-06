import { TUseNotificationsMutationsConfig } from '@/hooks/partner/use-notifications-mutations/use-notifications-mutations.types';
import { useAnalytics } from '@/providers/analytics.provider';
import { NotificationsHistoryService } from '@/service/partner/notifications-history';
import { NotificationsSettingsService } from '@/service/partner/notifications-settings';
import {
  INotificationsHistory,
  INotificationsHistoryResponse,
  INotificationsSettings,
} from '@/types/api/notifications.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useNotificationsMutations = ({
  storeId,
  notificationHistoryParams,
}: TUseNotificationsMutationsConfig) => {
  const queryClient = useQueryClient();
  const analytics = useAnalytics();

  const updateNotificationsSettingsMutation = useMutation({
    mutationFn: (notificationsSettings: Partial<INotificationsSettings>) =>
      NotificationsSettingsService.update(storeId, notificationsSettings),
    onSuccess: (data) => {
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.notificationsSettings(storeId),
        (old: INotificationsSettings) => ({
          ...old,
          ...data,
        }),
      );
      toast.success('Configurações de notificações atualizadas com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'notification',
        operation: 'update',
      });
      toast.error('Erro ao atualizar configurações de notificações');
    },
  });

  const updateNotificationsHistoryMutation = useMutation({
    mutationFn: (notificationsHistory: Partial<INotificationsHistory>) =>
      NotificationsHistoryService.update(storeId, notificationsHistory),
    onSuccess: (data, variables) => {
      if (variables.read) {
        analytics.track('notification_marked_read', { all: false });
      }

      queryClient.setQueryData(
        CACHE_QUERY_KEYS.notificationsHistory(
          storeId,
          notificationHistoryParams,
        ),
        (old: INotificationsHistoryResponse) => ({
          ...old,
          data: old.data.map((n) => (n.id === data.id ? { ...n, ...data } : n)),
        }),
      );
      toast.success('Histórico de notificações atualizado com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'notification',
        operation: 'update',
      });
      toast.error('Erro ao atualizar histórico de notificações');
    },
  });

  const markAllAsReadNotificationsHistoryMutation = useMutation({
    mutationFn: () => NotificationsHistoryService.markAllAsRead(storeId),
    onSuccess: () => {
      analytics.track('notification_marked_read', { all: true });
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.notificationsHistory(
          storeId,
          notificationHistoryParams,
        ),
        (old: INotificationsHistoryResponse) => ({
          ...old,
          data: old.data.map((n) => ({ ...n, read: true })),
        }),
      );
      toast.success('Todas as notificações marcadas como lidas');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'notification',
        operation: 'update',
      });
      toast.error('Erro ao marcar todas as notificações como lidas');
    },
  });

  const deleteNotificationsHistoryMutation = useMutation({
    mutationFn: (notificationId: string) =>
      NotificationsHistoryService.delete(storeId, notificationId),
    onSuccess: (data) => {
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.notificationsHistory(
          storeId,
          notificationHistoryParams,
        ),
        (old: INotificationsHistoryResponse) => ({
          ...old,
          data: old.data.filter((n) => n.id !== data.id),
        }),
      );
      analytics.track('notification_deleted', {});
      toast.success('Histórico de notificações excluído com sucesso');
    },
    onError: () => {
      analytics.track('partner_mutation_failed', {
        entity: 'notification',
        operation: 'delete',
      });
      toast.error('Erro ao excluir histórico de notificações');
    },
  });

  return {
    updateNotificationsSettingsMutation,
    updateNotificationsHistoryMutation,
    markAllAsReadNotificationsHistoryMutation,
    deleteNotificationsHistoryMutation,
  };
};
