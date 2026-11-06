import { useAnalytics } from '@/providers/analytics.provider';
import { WhatsappService } from '@/service/whatsapp';
import type {
  IWhatsappConfigPayload,
  IWhatsappConfigResponse,
  IWhatsappTestPayload,
} from '@/types/api/whatsapp.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useWhatsappMutation = () => {
  const queryClient = useQueryClient();
  const analytics = useAnalytics();

  const { mutate: saveConfig, isPending: isSaveConfigPending } = useMutation({
    mutationFn: (data: IWhatsappConfigPayload) =>
      WhatsappService.saveConfig(data),
    onSuccess: (data: IWhatsappConfigResponse) => {
      // Lê a config anterior antes de sobrescrever o cache.
      const previousConfig = queryClient.getQueryData<IWhatsappConfigResponse>(
        CACHE_QUERY_KEYS.whatsappConfig(data.store.id),
      );
      const wasActive = Boolean(previousConfig?.isActive);

      if (data.isActive && !wasActive) {
        analytics.track('whatsapp_connected', {
          store_id: data.store.id,
          is_first_config: !previousConfig?.id,
        });
      } else if (!data.isActive && wasActive) {
        analytics.track('whatsapp_disconnected', { store_id: data.store.id });
      }

      queryClient.setQueryData(
        CACHE_QUERY_KEYS.whatsappConfig(data.store.id),
        data,
      );
      void queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.whatsappStatus(data.store.id),
      });
      void queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.whatsappTemplates(data.store.id),
      });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: () => {
      analytics.track('whatsapp_config_save_failed', {});
      toast.error('Erro ao salvar configurações.');
    },
  });

  const { mutate: sendTest, isPending: isSendTestPending } = useMutation({
    mutationFn: ({
      storeId,
      payload,
    }: {
      storeId: string;
      payload: IWhatsappTestPayload;
    }) => WhatsappService.sendTest(storeId, payload),
    onSuccess: (data, variables) => {
      analytics.track('whatsapp_test_message_sent', {
        store_id: variables.storeId,
      });
      toast.success(data.message || 'Mensagem de teste enviada!');
    },
    onError: (error: unknown, variables) => {
      analytics.track('whatsapp_test_message_failed', {
        store_id: variables.storeId,
      });
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao enviar mensagem de teste.';
      toast.error(message);
    },
  });

  return {
    saveConfig,
    isSaveConfigPending,
    sendTest,
    isSendTestPending,
  };
};
