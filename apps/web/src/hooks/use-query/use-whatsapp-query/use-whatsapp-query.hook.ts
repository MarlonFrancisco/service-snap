import { WhatsappService } from '@/service/whatsapp';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

export const useWhatsappQuery = (storeId: string) => {
  const { data: whatsappConfig, isPending: isWhatsappPending } = useQuery({
    queryKey: CACHE_QUERY_KEYS.whatsappConfig(storeId),
    queryFn: () => WhatsappService.getConfig(storeId),
    enabled: Boolean(storeId),
  });

  const {
    data: whatsappStatus,
    isPending: isWhatsappStatusPending,
    refetch: refetchWhatsappStatus,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.whatsappStatus(storeId),
    queryFn: () => WhatsappService.getStatus(storeId),
    enabled: Boolean(storeId),
  });

  const {
    data: whatsappTemplates,
    isPending: isWhatsappTemplatesPending,
    isError: isWhatsappTemplatesError,
    error: whatsappTemplatesError,
    refetch: refetchWhatsappTemplates,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.whatsappTemplates(storeId),
    queryFn: () => WhatsappService.getTemplates(storeId),
    enabled: Boolean(storeId) && whatsappStatus?.status === 'connected',
    retry: false,
  });

  return {
    whatsappConfig,
    isWhatsappPending,
    whatsappStatus,
    isWhatsappStatusPending,
    refetchWhatsappStatus,
    whatsappTemplates,
    isWhatsappTemplatesPending,
    isWhatsappTemplatesError,
    whatsappTemplatesError,
    refetchWhatsappTemplates,
  };
};
