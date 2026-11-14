import { ApiKeysService } from '@/service/partner/api-keys';
import type { TCreateApiKey } from '@/types/api/api-keys.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TUseApiKeysMutationsConfig } from './use-api-keys-mutations.types';

export const useApiKeysMutations = ({
  storeId,
}: TUseApiKeysMutationsConfig) => {
  const queryClient = useQueryClient();
  const invalidateApiKeys = () =>
    queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.apiKeys(storeId),
    });

  // A chave inteira vem só nesta resposta: nada de guardar no cache depois
  const createApiKeyMutation = useMutation({
    mutationFn: (apiKey: TCreateApiKey) =>
      ApiKeysService.create(storeId, apiKey),
    onSuccess: invalidateApiKeys,
    gcTime: 0,
  });

  const revokeApiKeyMutation = useMutation({
    mutationFn: (id: string) => ApiKeysService.revoke(storeId, id),
    onSuccess: invalidateApiKeys,
  });

  return { createApiKeyMutation, revokeApiKeyMutation };
};
