'use client';

import { useApiKeysMutations } from '@/hooks/partner/use-api-keys-mutations';
import { useApiKeysQuery } from '@/hooks/partner/use-api-keys-query';
import type { TCreatedApiKey } from '@/types/api/api-keys.types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { sortApiKeys, toApiKeyRow } from '../../integrations-module.helpers';
import type { TApiKeyRow } from '../../integrations-module.types';
import type { TApiKeysCardConfig } from './api-keys-card.types';

export const useApiKeysCard = ({ storeId }: TApiKeysCardConfig) => {
  const [isNewKeyOpen, setIsNewKeyOpen] = useState(false);
  // A chave inteira vive só aqui, até a pessoa fechar o aviso ou sair da tela
  const [createdKey, setCreatedKey] = useState<TCreatedApiKey | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<TApiKeyRow | null>(null);

  const {
    apiKeys,
    isLoadingApiKeys,
    isFetchingApiKeys,
    isApiKeysError,
    refetchApiKeys,
  } = useApiKeysQuery({ storeId });
  const { revokeApiKeyMutation } = useApiKeysMutations({ storeId });

  // Chave de outra loja não fica na tela
  useEffect(() => {
    setCreatedKey(null);
  }, [storeId]);

  const rows = useMemo(() => sortApiKeys(apiKeys).map(toApiKeyRow), [apiKeys]);

  const handleConfirmRevoke = useCallback(() => {
    if (!pendingRevoke) return;

    revokeApiKeyMutation.mutate(pendingRevoke.id, {
      onSuccess: () => {
        toast.success('Chave revogada');
        if (createdKey?.id === pendingRevoke.id) setCreatedKey(null);
        setPendingRevoke(null);
      },
      onError: () => toast.error('Não foi possível revogar a chave'),
    });
  }, [pendingRevoke, revokeApiKeyMutation, createdKey]);

  const handleRevokeOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && !revokeApiKeyMutation.isPending) setPendingRevoke(null);
    },
    [revokeApiKeyMutation.isPending],
  );

  return {
    rows,
    isLoading: isLoadingApiKeys,
    isError: isApiKeysError,
    isRetrying: isFetchingApiKeys,
    handleRetry: () => void refetchApiKeys(),
    isNewKeyOpen,
    setIsNewKeyOpen,
    createdKey,
    handleKeyCreated: setCreatedKey,
    dismissCreatedKey: () => setCreatedKey(null),
    pendingRevoke,
    setPendingRevoke,
    handleRevokeOpenChange,
    handleConfirmRevoke,
    isRevoking: revokeApiKeyMutation.isPending,
  };
};
