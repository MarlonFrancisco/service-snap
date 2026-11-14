import { CheckoutService } from '@/service/partner/checkout';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import { retryPartnerQuery } from '../use-cash-query/use-cash-query.helpers';
import type {
  TUseCheckoutPreviewQueryConfig,
  TUseCheckoutQueryConfig,
} from './use-checkout-query.types';

/** Pacote, recompensas e se a visita já foi fechada. */
export const useCheckoutPreviewQuery = ({
  storeId,
  scheduleIds,
  enabled = true,
}: TUseCheckoutPreviewQueryConfig) => {
  // Ao fechar os detalhes a visita volta ao estado vazio, com id '': sem isso o
  // pedido sairia como `scheduleIds=` e a API responderia 400
  const canFetch =
    enabled &&
    !!storeId &&
    scheduleIds.length > 0 &&
    scheduleIds.every(Boolean);

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.checkoutPreview(storeId!, scheduleIds),
    queryFn: () => CheckoutService.preview(storeId!, scheduleIds),
    enabled: canFetch,
    retry: retryPartnerQuery,
  });

  return {
    preview: data,
    isLoadingPreview: canFetch && isPending,
    isFetchingPreview: isFetching,
    isPreviewError: canFetch && isError,
    refetchPreview: refetch,
  };
};

export const useCheckoutQuery = ({
  storeId,
  checkoutId,
  enabled = true,
}: TUseCheckoutQueryConfig) => {
  const canFetch = enabled && !!storeId && !!checkoutId;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.checkout(storeId!, checkoutId!),
    queryFn: () => CheckoutService.get(storeId!, checkoutId!),
    enabled: canFetch,
    retry: retryPartnerQuery,
  });

  return {
    checkout: data,
    isLoadingCheckout: canFetch && isPending,
    isCheckoutError: canFetch && isError,
    refetchCheckout: refetch,
  };
};
