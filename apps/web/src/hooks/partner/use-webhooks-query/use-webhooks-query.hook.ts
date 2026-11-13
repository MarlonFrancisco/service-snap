import { WebhooksService } from '@/service/partner/webhooks';
import type { IWebhookDelivery } from '@/types/api/webhooks.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import {
  isForbidden,
  retryUnlessDenied,
} from '../use-audit-logs-query/use-audit-logs-query.helpers';
import type {
  TUseWebhookDeliveriesQueryConfig,
  TUseWebhooksQueryConfig,
} from './use-webhooks-query.types';

/** Enquanto houver entrega na fila, a lista se atualiza sozinha. */
const PENDING_REFRESH_MS = 4000;

const hasPendingDelivery = (deliveries?: IWebhookDelivery[]) =>
  !!deliveries?.some((delivery) => delivery.status === 'pending');

export const useWebhooksQuery = ({
  storeId,
  enabled = true,
}: TUseWebhooksQueryConfig) => {
  const canFetch = enabled && !!storeId;

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.webhooks(storeId!),
    queryFn: () => WebhooksService.getAll(storeId!),
    enabled: canFetch,
    retry: retryUnlessDenied,
  });

  return {
    webhooks: data ?? [],
    isLoadingWebhooks: canFetch && isPending,
    isFetchingWebhooks: isFetching,
    isWebhooksError: canFetch && isError,
    isWebhooksForbidden: isForbidden(error),
    refetchWebhooks: refetch,
  };
};

export const useWebhookDeliveriesQuery = ({
  storeId,
  endpointId,
  enabled = true,
}: TUseWebhookDeliveriesQueryConfig) => {
  const canFetch = enabled && !!storeId && !!endpointId;

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.webhookDeliveries(storeId!, endpointId!),
    queryFn: () => WebhooksService.getDeliveries(storeId!, endpointId!),
    enabled: canFetch,
    retry: retryUnlessDenied,
    // O reenvio e as novas tentativas acontecem na fila, fora desta tela
    refetchInterval: (query) =>
      hasPendingDelivery(query.state.data) ? PENDING_REFRESH_MS : false,
  });

  return {
    deliveries: data ?? [],
    isLoadingDeliveries: canFetch && isPending,
    isFetchingDeliveries: isFetching,
    isDeliveriesError: canFetch && isError,
    refetchDeliveries: refetch,
  };
};
