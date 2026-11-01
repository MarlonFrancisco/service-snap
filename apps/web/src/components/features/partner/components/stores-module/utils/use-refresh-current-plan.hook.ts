import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/** `useStoreMutations` não invalida o plano, e o limite de lojas depende dele. */
export const useRefreshCurrentPlan = () => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.currentPlan(),
    });
  }, [queryClient]);
};
