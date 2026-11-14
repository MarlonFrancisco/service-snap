'use client';

import { useWebhooksMutations } from '@/hooks/partner/use-webhooks-mutations';
import { useWebhookDeliveriesQuery } from '@/hooks/partner/use-webhooks-query';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { toWebhookDeliveryRow } from '../../../integrations-module.helpers';
import type { TWebhookDeliveriesConfig } from './webhook-deliveries.types';

export const useWebhookDeliveries = ({
  storeId,
  endpointId,
}: TWebhookDeliveriesConfig) => {
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const {
    deliveries,
    isLoadingDeliveries,
    isFetchingDeliveries,
    isDeliveriesError,
    refetchDeliveries,
  } = useWebhookDeliveriesQuery({ storeId, endpointId });
  const { retryDeliveryMutation } = useWebhooksMutations({ storeId });

  const rows = useMemo(
    () => deliveries.map(toWebhookDeliveryRow),
    [deliveries],
  );

  // A API só põe na fila: a lista se atualiza sozinha enquanto houver pendente
  const handleRetry = useCallback(
    (deliveryId: string) => {
      setRetryingId(deliveryId);
      retryDeliveryMutation.mutate(
        { endpointId, deliveryId },
        {
          onSuccess: () => toast.success('Reenvio na fila'),
          onError: () => toast.error('Não foi possível reenviar'),
          onSettled: () => setRetryingId(null),
        },
      );
    },
    [endpointId, retryDeliveryMutation],
  );

  return {
    rows,
    isLoading: isLoadingDeliveries,
    isError: isDeliveriesError,
    isRefreshing: isFetchingDeliveries && !isLoadingDeliveries,
    handleReload: () => void refetchDeliveries(),
    handleRetry,
    retryingId,
  };
};
