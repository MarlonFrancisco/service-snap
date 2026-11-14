'use client';

import { useWebhooksMutations } from '@/hooks/partner/use-webhooks-mutations';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  describeDisabledEndpoint,
  describePingResult,
  describeWebhookEvents,
} from '../../../integrations-module.helpers';
import { useCopyToClipboard } from '../../one-time-secret';
import type {
  TWebhookConfirmAction,
  TWebhookEndpointItemConfig,
} from './webhook-endpoint-item.types';

export const useWebhookEndpointItem = ({
  storeId,
  endpoint,
  onShowDeliveries,
}: TWebhookEndpointItemConfig) => {
  // O segredo aberto fica só neste item, enquanto a tela estiver aberta
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] =
    useState<TWebhookConfirmAction>(null);
  const {
    revealSecretMutation,
    rotateSecretMutation,
    sendTestMutation,
    removeWebhookMutation,
    updateWebhookMutation,
  } = useWebhooksMutations({ storeId });
  const { copy, isCopied } = useCopyToClipboard({
    successMessage: 'Segredo copiado',
  });

  const handleRevealSecret = useCallback(() => {
    revealSecretMutation.mutate(endpoint.id, {
      onSuccess: ({ secret }) => {
        setRevealedSecret(secret);
        revealSecretMutation.reset();
      },
      onError: () => toast.error('Não foi possível mostrar o segredo'),
    });
  }, [endpoint.id, revealSecretMutation]);

  const handleHideSecret = useCallback(() => setRevealedSecret(null), []);

  const handleRotateSecret = useCallback(() => {
    rotateSecretMutation.mutate(endpoint.id, {
      onSuccess: ({ secret }) => {
        setRevealedSecret(secret);
        rotateSecretMutation.reset();
        setConfirmAction(null);
        toast.success('Segredo trocado. Atualize no seu sistema.');
      },
      onError: () => toast.error('Não foi possível trocar o segredo'),
    });
  }, [endpoint.id, rotateSecretMutation]);

  const handleSendTest = useCallback(() => {
    sendTestMutation.mutate(endpoint.id, {
      onSuccess: (result) => {
        const message = describePingResult(result);

        if (result.ok) toast.success(message);
        else toast.error(message);
      },
      onError: () => toast.error('Não foi possível enviar o teste'),
      onSettled: () => onShowDeliveries(endpoint.id),
    });
  }, [endpoint.id, sendTestMutation, onShowDeliveries]);

  const handleRemove = useCallback(() => {
    removeWebhookMutation.mutate(endpoint.id, {
      onSuccess: () => {
        setConfirmAction(null);
        toast.success('Webhook excluído');
      },
      onError: () => toast.error('Não foi possível excluir o webhook'),
    });
  }, [endpoint.id, removeWebhookMutation]);

  const handleReactivate = useCallback(() => {
    updateWebhookMutation.mutate(
      { id: endpoint.id, changes: { isActive: true } },
      {
        onSuccess: () => toast.success('Webhook religado'),
        onError: () => toast.error('Não foi possível religar o webhook'),
      },
    );
  }, [endpoint.id, updateWebhookMutation]);

  const isConfirming =
    rotateSecretMutation.isPending || removeWebhookMutation.isPending;

  const handleConfirmOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && !isConfirming) setConfirmAction(null);
    },
    [isConfirming],
  );

  const handleConfirm = useCallback(() => {
    if (confirmAction === 'rotate') handleRotateSecret();
    if (confirmAction === 'remove') handleRemove();
  }, [confirmAction, handleRotateSecret, handleRemove]);

  return {
    eventsLabel: describeWebhookEvents(endpoint.events),
    statusLabel: endpoint.isActive ? 'Ativo' : 'Desligado',
    disabledLabel: describeDisabledEndpoint(endpoint),
    revealedSecret,
    handleRevealSecret,
    handleHideSecret,
    handleCopySecret: () => {
      if (revealedSecret) void copy(revealedSecret);
    },
    isSecretCopied: isCopied,
    isRevealingSecret: revealSecretMutation.isPending,
    handleSendTest,
    isSendingTest: sendTestMutation.isPending,
    handleReactivate,
    isReactivating: updateWebhookMutation.isPending,
    confirmAction,
    setConfirmAction,
    handleConfirmOpenChange,
    handleConfirm,
    isConfirming,
  };
};
