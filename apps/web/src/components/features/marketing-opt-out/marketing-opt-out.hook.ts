'use client';

import { isApiHttpError } from '@/service/api';
import { MarketingOptOutService } from '@/service/marketing';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { TMarketingOptOutState } from './marketing-opt-out.types';

/** Link vencido, adulterado ou de loja removida: tentar de novo não resolve. */
const EXPIRED_STATUS = [400, 404, 410];

const isExpiredError = (error: unknown) =>
  isApiHttpError(error) && EXPIRED_STATUS.includes(error.status);

/** Link "Sair da lista" do e-mail de campanha, sem login. */
export const useMarketingOptOut = (token: string) => {
  const queryClient = useQueryClient();
  const queryKey = CACHE_QUERY_KEYS.marketingOptOut(token);

  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: () => MarketingOptOutService.getLink(token),
    enabled: !!token,
    staleTime: 0,
    retry: (failureCount, queryError) =>
      !isExpiredError(queryError) && failureCount < 2,
  });

  // Sair pede um clique de propósito: abrir o link não tira ninguém da lista
  // (leitores de e-mail costumam abrir os links para checar segurança).
  const { mutate: optOut, isPending: isOptingOut } = useMutation({
    mutationFn: () => MarketingOptOutService.optOut(token),
    onSuccess: (result) => queryClient.setQueryData(queryKey, result),
    onError: (mutationError) => {
      if (isExpiredError(mutationError)) {
        void refetch();
        return;
      }
      toast.error('Não foi possível tirar você da lista. Tente de novo.');
    },
  });

  const getState = (): TMarketingOptOutState => {
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
