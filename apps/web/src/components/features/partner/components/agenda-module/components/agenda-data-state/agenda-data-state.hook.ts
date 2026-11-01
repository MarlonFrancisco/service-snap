import { useStoreQuery } from '@/hooks/use-query/use-store-query';
import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { ScheduleService } from '@/service/partner/schedule';
import { usePartnerStore } from '@/store/partner';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { TAgendaDataStatus } from './agenda-data-state.types';

export const useAgendaSchedulesQuery = () => {
  const storeId = usePartnerStore((state) => state.activeStore.id);

  return useQuery({
    queryKey: CACHE_QUERY_KEYS.schedules(storeId),
    queryFn: () => ScheduleService.getAll(storeId),
    enabled: !!storeId,
  });
};

/**
 * Estado dos dados da agenda. Só mostra erro quando não há o que exibir: uma
 * atualização que falha mantém na tela os agendamentos já carregados.
 */
export const useAgendaDataState = () => {
  const storeId = usePartnerStore((state) => state.activeStore.id);
  const { stores, isPendingStores, isError: isStoresError } = useStoresQuery();
  // Mesma consulta do casco, que preenche a loja ativa: sem ela a tela não sai do skeleton.
  const firstStoreId = stores[0]?.id ?? '';
  const { isError: isFirstStoreError } = useStoreQuery({
    storeId: storeId ? '' : firstStoreId,
  });
  const {
    data: appointments,
    isError: isSchedulesError,
    isFetching,
    refetch,
  } = useAgendaSchedulesQuery();

  const getStatus = (): TAgendaDataStatus => {
    if (!storeId) {
      if (isStoresError || isFirstStoreError) return 'error';
      if (!isPendingStores && stores.length === 0) return 'no-store';
      return 'loading';
    }

    if (appointments) return 'ready';
    if (isSchedulesError && !isFetching) return 'error';
    return 'loading';
  };

  const handleRetry = useCallback(() => {
    if (storeId) {
      refetch();
      return;
    }

    const queryClient = getQueryClient();
    queryClient.invalidateQueries({ queryKey: CACHE_QUERY_KEYS.stores() });

    if (firstStoreId) {
      queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.store(firstStoreId),
      });
    }
  }, [storeId, firstStoreId, refetch]);

  return {
    status: getStatus(),
    handleRetry,
  };
};
