import { AdminService } from '@/service/admin';
import type { IAdminStore } from '@/types/api/admin.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TUpdateAdminStoreVariables } from './use-admin-mutations.types';

export const useAdminMutations = () => {
  const queryClient = useQueryClient();

  /** Suspende ou reativa; a loja volta pronta e a lista e os números recarregam. */
  const updateStoreMutation = useMutation({
    mutationFn: ({ storeId, changes }: TUpdateAdminStoreVariables) =>
      AdminService.updateStore(storeId, changes),
    onSuccess: (store: IAdminStore) => {
      queryClient.setQueryData(CACHE_QUERY_KEYS.adminStore(store.id), store);

      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: CACHE_QUERY_KEYS.adminStores().slice(0, 1),
        }),
        queryClient.invalidateQueries({
          queryKey: CACHE_QUERY_KEYS.adminOverview(),
        }),
        queryClient.invalidateQueries({
          queryKey: CACHE_QUERY_KEYS.adminAuditLogs().slice(0, 1),
        }),
      ]);
    },
  });

  return { updateStoreMutation };
};
