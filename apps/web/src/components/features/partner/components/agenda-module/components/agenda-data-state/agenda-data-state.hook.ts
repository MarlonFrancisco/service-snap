import { useStoreQuery } from '@/hooks/use-query/use-store-query';
import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { HolidaysService } from '@/service/partner/holidays';
import { ScheduleService } from '@/service/partner/schedule';
import type { IStoreHoliday } from '@/types/api/holidays.types';
import {
  selectMonthGridDates,
  selectWeekDates,
  toDateKey,
  useAgendaStore,
} from '@/store/admin/agenda';
import { usePartnerStore } from '@/store/partner';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useIsMobile } from '@repo/ui';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { TAgendaDataStatus } from './agenda-data-state.types';

const EMPTY_HOLIDAYS: IStoreHoliday[] = [];

/**
 * Período mostrado: a semana (também na visão Dia, que navega dentro dela) ou
 * a grade inteira do mês. No mobile a agenda é sempre por semana.
 */
export const useAgendaRange = () => {
  const isMobile = useIsMobile();
  const viewMode = useAgendaStore((state) => state.viewMode);
  const isFocusMode = useAgendaStore((state) => state.isFocusMode);
  const weekDates = useAgendaStore(selectWeekDates);
  const monthDates = useAgendaStore(selectMonthGridDates);

  const isMonth = viewMode === 'month' && !isMobile && !isFocusMode;
  const dates = isMonth ? monthDates : weekDates;
  const first = dates[0];
  const last = dates.at(-1);
  const from = first ? toDateKey(first) : '';
  const to = last ? toDateKey(last) : '';

  return useMemo(() => ({ from, to }), [from, to]);
};

export const useAgendaSchedulesQuery = () => {
  const storeId = usePartnerStore((state) => state.activeStore.id);
  const range = useAgendaRange();

  return useQuery({
    queryKey: CACHE_QUERY_KEYS.schedulesRange(storeId, range),
    queryFn: () => ScheduleService.getAll(storeId, range),
    enabled: !!storeId && !!range.from,
    // Trocar de semana não volta ao skeleton: os blocos são filtrados por data.
    // Outra loja não herda a agenda anterior.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[0] === CACHE_QUERY_KEYS.schedules(storeId)[0]
        ? previous
        : undefined,
  });
};

export const useAgendaHolidaysQuery = () => {
  const storeId = usePartnerStore((state) => state.activeStore.id);
  const range = useAgendaRange();

  const { data: holidays = EMPTY_HOLIDAYS } = useQuery({
    queryKey: CACHE_QUERY_KEYS.holidays(storeId, range),
    queryFn: () => HolidaysService.getAll(storeId, range),
    enabled: !!storeId && !!range.from,
  });

  return holidays;
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
