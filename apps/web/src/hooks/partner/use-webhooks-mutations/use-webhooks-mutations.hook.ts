import { WebhooksService } from '@/service/partner/webhooks';
import type { TCreateWebhookEndpoint } from '@/types/api/webhooks.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  TRetryDeliveryVariables,
  TUpdateWebhookVariables,
  TUseWebhooksMutationsConfig,
} from './use-webhooks-mutations.types';

/**
 * Criar, mostrar e trocar o segredo devolvem o segredo inteiro: `gcTime: 0`
 * tira a resposta do cache assim que a tela guarda o valor.
 */
export const useWebhooksMutations = ({
  storeId,
}: TUseWebhooksMutationsConfig) => {
  const queryClient = useQueryClient();

  const invalidateWebhooks = () =>
    queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.webhooks(storeId),
    });

  const invalidateDeliveries = (endpointId: string) =>
    queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.webhookDeliveries(storeId, endpointId),
    });

  const createWebhookMutation = useMutation({
    mutationFn: (endpoint: TCreateWebhookEndpoint) =>
      WebhooksService.create(storeId, endpoint),
    onSuccess: invalidateWebhooks,
    gcTime: 0,
  });

  const updateWebhookMutation = useMutation({
    mutationFn: ({ id, changes }: TUpdateWebhookVariables) =>
      WebhooksService.update(storeId, id, changes),
    onSuccess: invalidateWebhooks,
  });

  const removeWebhookMutation = useMutation({
    mutationFn: (id: string) => WebhooksService.remove(storeId, id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: CACHE_QUERY_KEYS.webhookDeliveries(storeId, id),
      });
      return invalidateWebhooks();
    },
  });

  const revealSecretMutation = useMutation({
    mutationFn: (id: string) => WebhooksService.revealSecret(storeId, id),
    gcTime: 0,
  });

  const rotateSecretMutation = useMutation({
    mutationFn: (id: string) => WebhooksService.rotateSecret(storeId, id),
    gcTime: 0,
  });

  // O teste conta para a saúde do endpoint (falhas seguidas)
  const sendTestMutation = useMutation({
    mutationFn: (id: string) => WebhooksService.sendTest(storeId, id),
    onSettled: (_, __, id) =>
      Promise.all([invalidateDeliveries(id), invalidateWebhooks()]),
  });

  const retryDeliveryMutation = useMutation({
    mutationFn: ({ endpointId, deliveryId }: TRetryDeliveryVariables) =>
      WebhooksService.retryDelivery(storeId, endpointId, deliveryId),
    onSuccess: (_, { endpointId }) => invalidateDeliveries(endpointId),
  });

  return {
    createWebhookMutation,
    updateWebhookMutation,
    removeWebhookMutation,
    revealSecretMutation,
    rotateSecretMutation,
    sendTestMutation,
    retryDeliveryMutation,
  };
};
