'use client';

import { useScheduleSeriesMutations } from '@/hooks/partner/use-schedule-series-mutations';
import { useScheduleSeriesQuery } from '@/hooks/partner/use-schedule-series-query';
import { usePartnerStore } from '@/store';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  formatSeriesDay,
  formatSeriesFrequency,
} from '../../schedule-series-module.helpers';
import type {
  TSeriesCancelScope,
  TUseScheduleSeriesCancelConfig,
} from './schedule-series-cancel.types';

export const useScheduleSeriesCancel = ({
  scheduleId,
  seriesId,
  onDone,
}: TUseScheduleSeriesCancelConfig) => {
  const storeId = usePartnerStore((state) => state.activeStore?.id) ?? '';
  const [scope, setScope] = useState<TSeriesCancelScope>('one');

  const { series, isLoadingSeries, isSeriesError } = useScheduleSeriesQuery({
    storeId,
    seriesId,
  });
  const { cancelSeriesMutation, cancelOneMutation } =
    useScheduleSeriesMutations({ storeId });

  const current = series?.items.find((item) => item.scheduleId === scheduleId);

  // Cada serviço da data é uma linha: conta datas, não linhas
  const followingCount = useMemo(() => {
    if (!series || !current) return 0;

    return new Set(
      series.items
        .filter(
          (item) => item.status === 'scheduled' && item.date > current.date,
        )
        .map((item) => item.occurrence),
    ).size;
  }, [series, current]);

  const description = current
    ? `${formatSeriesDay(current.date)} às ${current.startTime} faz parte de uma série que se repete ${formatSeriesFrequency(series?.intervalWeeks ?? 1)}.`
    : 'Este agendamento faz parte de uma série.';

  const isCancelling =
    cancelSeriesMutation.isPending || cancelOneMutation.isPending;

  const handleConfirm = useCallback(() => {
    const onError = () =>
      toast.error('Não foi possível cancelar. Tente de novo.');

    if (scope === 'following' && current) {
      cancelSeriesMutation.mutate(
        { seriesId, from: current.date },
        {
          onSuccess: ({ cancelled }) => {
            toast.success(
              cancelled.length > 1
                ? 'Agendamentos da série cancelados'
                : 'Agendamento cancelado',
            );
            onDone();
          },
          onError,
        },
      );
      return;
    }

    cancelOneMutation.mutate(
      { scheduleId, seriesId },
      {
        onSuccess: () => {
          toast.success('Agendamento cancelado');
          onDone();
        },
        onError,
      },
    );
  }, [
    scope,
    current,
    seriesId,
    scheduleId,
    cancelSeriesMutation,
    cancelOneMutation,
    onDone,
  ]);

  return {
    scope,
    setScope,
    description,
    followingCount,
    // Sem saber a data, não dá para cancelar "daqui em diante"
    canCancelFollowing: !!current && followingCount > 0,
    isLoading: isLoadingSeries,
    isError: isSeriesError,
    isCancelling,
    handleConfirm,
  };
};
