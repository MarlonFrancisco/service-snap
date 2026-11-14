'use client';

import { useWebhooksQuery } from '@/hooks/partner/use-webhooks-query';
import type {
  IWebhookEndpoint,
  TCreatedWebhookEndpoint,
} from '@/types/api/webhooks.types';
import { useCallback, useEffect, useState } from 'react';
import type {
  TCreatedWebhookSecret,
  TWebhooksCardConfig,
} from './webhooks-card.types';

export const useWebhooksCard = ({ storeId }: TWebhooksCardConfig) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] =
    useState<IWebhookEndpoint | null>(null);
  const [deliveriesEndpointId, setDeliveriesEndpointId] = useState<
    string | null
  >(null);
  // O segredo inteiro vive só aqui, até a pessoa fechar o aviso
  const [createdSecret, setCreatedSecret] =
    useState<TCreatedWebhookSecret | null>(null);

  const {
    webhooks,
    isLoadingWebhooks,
    isFetchingWebhooks,
    isWebhooksError,
    refetchWebhooks,
  } = useWebhooksQuery({ storeId });

  // Segredo e seleção de outra loja não ficam na tela
  useEffect(() => {
    setCreatedSecret(null);
    setDeliveriesEndpointId(null);
  }, [storeId]);

  // Sem escolha (ou endpoint excluído), as entregas são do primeiro
  const selectedEndpointId =
    webhooks.find((endpoint) => endpoint.id === deliveriesEndpointId)?.id ??
    webhooks[0]?.id ??
    null;

  const openCreate = useCallback(() => {
    setEditingEndpoint(null);
    setIsDialogOpen(true);
  }, []);

  const openEdit = useCallback((endpoint: IWebhookEndpoint) => {
    setEditingEndpoint(endpoint);
    setIsDialogOpen(true);
  }, []);

  const handleCreated = useCallback((created: TCreatedWebhookEndpoint) => {
    setCreatedSecret({ url: created.url, secret: created.secret });
    setDeliveriesEndpointId(created.id);
  }, []);

  return {
    webhooks,
    isLoading: isLoadingWebhooks,
    isError: isWebhooksError,
    isRetrying: isFetchingWebhooks,
    handleRetry: () => void refetchWebhooks(),
    isDialogOpen,
    setIsDialogOpen,
    editingEndpoint,
    openCreate,
    openEdit,
    handleCreated,
    createdSecret,
    dismissCreatedSecret: () => setCreatedSecret(null),
    selectedEndpointId,
    setDeliveriesEndpointId,
  };
};
