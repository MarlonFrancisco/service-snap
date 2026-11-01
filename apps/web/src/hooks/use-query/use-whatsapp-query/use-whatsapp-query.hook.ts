import { isApiHttpError } from '@/service/api';
import { WhatsappService } from '@/service/whatsapp';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

/**
 * O padrão do app repete 3 vezes (1s + 2s + 4s), com `isPending` verdadeiro durante
 * toda a espera. Erro 4xx não muda com nova tentativa, e falha transitória só repete uma.
 */
const retryTransientFailureOnce = (failureCount: number, error: unknown) => {
  if (isApiHttpError(error) && error.status < 500) return false;
  return failureCount < 1;
};

export const useWhatsappQuery = (storeId: string) => {
  const {
    data: whatsappConfig,
    isPending: isWhatsappPending,
    isError: isWhatsappError,
    error: whatsappError,
    isFetching: isWhatsappFetching,
    refetch: refetchWhatsapp,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.whatsappConfig(storeId),
    queryFn: () => WhatsappService.getConfig(storeId),
    enabled: Boolean(storeId),
    retry: retryTransientFailureOnce,
  });

  const {
    data: whatsappStatus,
    isPending: isWhatsappStatusPending,
    isError: isWhatsappStatusError,
    isFetching: isWhatsappStatusFetching,
    refetch: refetchWhatsappStatus,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.whatsappStatus(storeId),
    queryFn: () => WhatsappService.getStatus(storeId),
    enabled: Boolean(storeId),
    retry: retryTransientFailureOnce,
  });

  const {
    data: whatsappTemplates,
    isPending: isWhatsappTemplatesPending,
    isError: isWhatsappTemplatesError,
    error: whatsappTemplatesError,
    isFetching: isWhatsappTemplatesFetching,
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
    isWhatsappError,
    whatsappError,
    isWhatsappFetching,
    refetchWhatsapp,
    whatsappStatus,
    isWhatsappStatusPending,
    isWhatsappStatusError,
    isWhatsappStatusFetching,
    refetchWhatsappStatus,
    whatsappTemplates,
    isWhatsappTemplatesPending,
    isWhatsappTemplatesError,
    whatsappTemplatesError,
    isWhatsappTemplatesFetching,
    refetchWhatsappTemplates,
  };
};
