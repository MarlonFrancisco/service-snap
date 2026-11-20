'use client';

import { useAnalytics } from '@/providers/analytics.provider';
import { isApiHttpError } from '@/service/api';
import { WhatsappOptOutService } from '@/service/whatsapp-consent';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { TWhatsappOptOutState } from './whatsapp-opt-out.types';

/** Link vencido, adulterado ou de loja removida: tentar de novo não resolve. */
const EXPIRED_STATUS = [400, 404, 410];

const isExpiredError = (error: unknown) =>
  isApiHttpError(error) && EXPIRED_STATUS.includes(error.status);

/** Link "Deixar de receber por WhatsApp" do e-mail, sem login (#37). */
export const useWhatsappOptOut = (token: string) => {
  const queryClient = useQueryClient();
  const analytics = useAnalytics();
  const queryKey = CACHE_QUERY_KEYS.whatsappOptOut(token);

  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: () => WhatsappOptOutService.getLink(token),
    enabled: !!token,
    staleTime: 0,
    retry: (failureCount, queryError) =>
      !isExpiredError(queryError) && failureCount < 2,
  });

  // Sair pede um clique: leitores de e-mail abrem os links para checar segurança
  const { mutate: optOut, isPending: isOptingOut } = useMutation({
    mutationFn: () => WhatsappOptOutService.optOut(token),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, result);
      analytics.track('whatsapp_opt_out', { method: 'email_link' });
    },
    onError: (mutationError) => {
      if (isExpiredError(mutationError)) {
        void refetch();
        return;
      }
      toast.error('Não foi possível concluir. Tente de novo.');
    },
  });

  const getState = (): TWhatsappOptOutState => {
    if (isError) return isExpiredError(error) ? 'expired' : 'error';
    if (isPending || !data) return 'loading';
    return data.optedOut ? 'done' : 'confirm';
  };

  return {
    state: getState(),
    storeName: data?.storeName ?? '',
    isOptingOut,
    handleOptOut: () => optOut(),
    handleRetry: () => void refetch(),
    isRetrying: isRefetching,
  };
};
