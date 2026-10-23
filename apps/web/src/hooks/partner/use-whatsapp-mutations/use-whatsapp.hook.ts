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

  const { mutate: saveConfig, isPending: isSaveConfigPending } = useMutation({
    mutationFn: (data: IWhatsappConfigPayload) =>
      WhatsappService.saveConfig(data),
    onSuccess: (data: IWhatsappConfigResponse) => {
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
    onSuccess: (data) => {
      toast.success(data.message || 'Mensagem de teste enviada!');
    },
    onError: (error: unknown) => {
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
