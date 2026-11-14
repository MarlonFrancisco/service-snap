import { invalidateCustomers } from '@/hooks/partner/use-customers-mutations';
import { ScheduleService } from '@/service/partner/schedule';
import { ScheduleSeriesService } from '@/service/partner/schedule-series';
import type { TCreateScheduleSeries } from '@/types/api/schedule-series.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type {
  TCancelScheduleSeriesVariables,
  TUseScheduleSeriesMutationsConfig,
} from './use-schedule-series-mutations.types';

/**
 * Série recorrente: criar mexe na agenda, nos horários livres e na lista de
 * clientes; cancelar mexe na agenda e na própria série.
 */
export const useScheduleSeriesMutations = ({
  storeId,
}: TUseScheduleSeriesMutationsConfig) => {
  const queryClient = useQueryClient();

  const invalidateAgenda = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.schedules(storeId),
    });
    void queryClient.invalidateQueries({
      queryKey: [`partner/schedules/${storeId}/availability`],
    });
  }, [queryClient, storeId]);

  const createSeriesMutation = useMutation({
    mutationFn: (series: TCreateScheduleSeries) =>
      ScheduleSeriesService.create(storeId, series),
    onSuccess: () => {
      invalidateAgenda();
      void invalidateCustomers(queryClient, storeId);
    },
  });

  const cancelSeriesMutation = useMutation({
    mutationFn: ({ seriesId, from }: TCancelScheduleSeriesVariables) =>
      ScheduleSeriesService.cancel(storeId, seriesId, { from }),
    onSuccess: (_, { seriesId }) => {
      invalidateAgenda();
      void queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.scheduleSeries(storeId, seriesId),
      });
    },
  });

  /** "Só este": o cancelamento comum, que também tira a data da série. */
  const cancelOneMutation = useMutation({
    mutationFn: ({ scheduleId }: { scheduleId: string; seriesId: string }) =>
      ScheduleService.delete(storeId, scheduleId),
    onSuccess: (_, { seriesId }) => {
      invalidateAgenda();
      void queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.scheduleSeries(storeId, seriesId),
      });
    },
  });

  return { createSeriesMutation, cancelSeriesMutation, cancelOneMutation };
};
