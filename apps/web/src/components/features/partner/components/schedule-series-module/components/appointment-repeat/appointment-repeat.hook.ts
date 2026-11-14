'use client';

import { useScheduleSeriesMutations } from '@/hooks/partner/use-schedule-series-mutations';
import { ScheduleService } from '@/service/partner/schedule';
import type { TSeriesIntervalWeeks } from '@/types/api/schedule-series.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQueries } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { addMinutesToTime } from '../../../agenda-module/components/add-appointment-responsive/add-appointment.helpers';
import {
  buildSeriesDates,
  DEFAULT_SERIES_OCCURRENCES,
  formatSeriesDay,
  formatSeriesRule,
  getCreateSeriesErrorMessage,
  getMaxOccurrences,
  getSeriesConflictReason,
  MIN_SERIES_OCCURRENCES,
  SERIES_INTERVAL_OPTIONS,
} from '../../schedule-series-module.helpers';
import type {
  TSeriesPreviewItem,
  TSeriesPreviewStatus,
  TSeriesResult,
  TSeriesSubmitPayload,
} from '../../schedule-series-module.types';
import type {
  TAppointmentRepeatConfig,
  TUseAppointmentRepeatConfig,
} from './appointment-repeat.types';

const isIntervalWeeks = (value: number): value is TSeriesIntervalWeeks =>
  SERIES_INTERVAL_OPTIONS.some((option) => option.value === value);

/**
 * "Repetir" do agendamento manual: a regra, a prévia das datas (livre ou
 * ocupada pelos horários oferecidos) e o resultado da série criada, com as
 * datas que ficaram de fora para escolher outro horário.
 */
export const useAppointmentRepeat = ({
  storeId,
  isOpen,
  serviceIds,
  storeMemberId,
  date,
  time,
  isFitIn,
  durationMinutes,
  professionalName,
  onPickAnotherTime,
  onClose,
}: TUseAppointmentRepeatConfig) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [intervalWeeks, setIntervalWeeks] = useState<TSeriesIntervalWeeks>(1);
  const [occurrencesInput, setOccurrencesInput] = useState(
    String(DEFAULT_SERIES_OCCURRENCES),
  );
  const [result, setResult] = useState<TSeriesResult | null>(null);
  const [isResultVisible, setIsResultVisible] = useState(false);
  // Data da série que está sendo remarcada como agendamento avulso
  const [resolvingDate, setResolvingDate] = useState<string | null>(null);

  const { createSeriesMutation } = useScheduleSeriesMutations({ storeId });

  // Cada abertura do formulário começa sem repetir
  useEffect(() => {
    if (!isOpen) return;

    setIsEnabled(false);
    setIntervalWeeks(1);
    setOccurrencesInput(String(DEFAULT_SERIES_OCCURRENCES));
    setResult(null);
    setIsResultVisible(false);
    setResolvingDate(null);
  }, [isOpen]);

  const maxOccurrences = getMaxOccurrences(intervalWeeks);
  const parsedOccurrences = Number(occurrencesInput);
  const isOccurrencesValid =
    Number.isInteger(parsedOccurrences) &&
    parsedOccurrences >= MIN_SERIES_OCCURRENCES &&
    parsedOccurrences <= maxOccurrences;
  const occurrences = isOccurrencesValid
    ? parsedOccurrences
    : Math.min(
        Math.max(parsedOccurrences || DEFAULT_SERIES_OCCURRENCES, 2),
        maxOccurrences,
      );

  const dates = useMemo(
    () =>
      isEnabled && date
        ? buildSeriesDates(date, intervalWeeks, occurrences)
        : [],
    [isEnabled, date, intervalWeeks, occurrences],
  );

  // Mesma chave do formulário: a primeira data já vem do cache
  const canCheck =
    isOpen &&
    isEnabled &&
    !!storeId &&
    serviceIds.length > 0 &&
    !!storeMemberId &&
    !!time &&
    !isFitIn;
  const availability = useQueries({
    queries: dates.map((day) => {
      const params = { date: day, serviceIds, memberId: storeMemberId };

      return {
        queryKey: CACHE_QUERY_KEYS.availability(storeId, params),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          ScheduleService.getAvailability(storeId, params, { signal }),
        enabled: canCheck,
        staleTime: 0,
      };
    }),
  });

  const preview = useMemo<TSeriesPreviewItem[]>(() => {
    const timeLabel = time
      ? `${time} às ${addMinutesToTime(time, durationMinutes)}`
      : 'Horário a escolher';

    return dates.map((day, index) => {
      const query = availability[index];
      const getStatus = (): TSeriesPreviewStatus => {
        if (!time) return 'no-time';
        if (isFitIn) return 'fit-in';
        if (!canCheck || !query || query.isError) return 'unknown';
        if (query.isPending) return 'checking';

        const isFree = (query.data ?? []).some(
          (slot) =>
            slot.time === time &&
            slot.available &&
            (!slot.storeMemberId || slot.storeMemberId === storeMemberId),
        );

        return isFree ? 'free' : 'busy';
      };

      return {
        date: day,
        dayLabel: formatSeriesDay(day),
        timeLabel,
        status: getStatus(),
      };
    });
  }, [
    dates,
    availability,
    time,
    isFitIn,
    canCheck,
    durationMinutes,
    storeMemberId,
  ]);

  const freeCount = preview.filter(({ status }) => status === 'free').length;
  const isPreviewChecked = preview.every(
    ({ status }) => status === 'free' || status === 'busy',
  );
  const submitCount =
    isPreviewChecked && freeCount > 0 ? freeCount : occurrences;

  const handleToggle = useCallback((next: boolean) => {
    setIsEnabled(next);
    if (next) setResolvingDate(null);
  }, []);

  const handleIntervalChange = useCallback(
    (value: string) => {
      const next = Number(value);

      if (!isIntervalWeeks(next)) return;
      setIntervalWeeks(next);

      // Menos vezes cabem em 6 meses com intervalo maior
      const max = getMaxOccurrences(next);
      if (Number(occurrencesInput) > max) setOccurrencesInput(String(max));
    },
    [occurrencesInput],
  );

  const submitSeries = useCallback(
    (
      payload: TSeriesSubmitPayload,
      { onError }: { onError: (message: string) => void },
    ) => {
      if (!isOccurrencesValid) {
        onError(`Escolha de 2 a ${maxOccurrences} vezes.`);
        return;
      }

      createSeriesMutation.mutate(
        { ...payload, intervalWeeks, occurrences },
        {
          onSuccess: (created) => {
            const createdCount = created.created.length;
            const summary = `Série criada: ${createdCount} de ${occurrences} datas`;

            toast.success(summary);

            if (!created.conflicts.length) {
              onClose();
              return;
            }

            setResult({
              seriesId: created.id,
              createdCount,
              totalCount: occurrences,
              ruleLabel: formatSeriesRule({
                intervalWeeks,
                date: payload.date,
                time: payload.startTime,
                professionalName,
              }),
              conflicts: created.conflicts.map((conflict) => ({
                date: conflict.date,
                dayLabel: formatSeriesDay(conflict.date),
                reasonLabel: getSeriesConflictReason(conflict.reason, {
                  professionalName,
                  time: payload.startTime,
                }),
              })),
            });
            setIsResultVisible(true);
          },
          onError: (error) => onError(getCreateSeriesErrorMessage(error)),
        },
      );
    },
    [
      createSeriesMutation,
      intervalWeeks,
      occurrences,
      isOccurrencesValid,
      maxOccurrences,
      professionalName,
      onClose,
    ],
  );

  const handlePickAnotherTime = useCallback(
    (conflictDate: string) => {
      setResolvingDate(conflictDate);
      setIsEnabled(false);
      setIsResultVisible(false);
      onPickAnotherTime(conflictDate);
    },
    [onPickAnotherTime],
  );

  /**
   * Agendamento avulso criado. Se era uma data da série e ainda sobram
   * outras de fora, volta para a lista (true); senão quem chamou fecha.
   */
  const handleSingleCreated = useCallback(() => {
    if (!resolvingDate || !result) return false;

    const remaining = result.conflicts.filter(
      (conflict) => conflict.date !== resolvingDate,
    );

    setResolvingDate(null);
    if (!remaining.length) return false;

    setResult({ ...result, conflicts: remaining });
    setIsResultVisible(true);
    return true;
  }, [resolvingDate, result]);

  const section: TAppointmentRepeatConfig = {
    isEnabled,
    onToggle: handleToggle,
    intervalWeeks,
    intervalOptions: SERIES_INTERVAL_OPTIONS,
    onIntervalChange: handleIntervalChange,
    occurrences: occurrencesInput,
    onOccurrencesChange: setOccurrencesInput,
    maxOccurrences,
    occurrencesError:
      isEnabled && occurrencesInput !== '' && !isOccurrencesValid
        ? `Escolha de 2 a ${maxOccurrences} vezes`
        : undefined,
    preview,
  };

  return {
    section,
    isEnabled,
    isSubmitting: createSeriesMutation.isPending,
    submitLabel: isEnabled
      ? `Agendar ${submitCount} ${submitCount === 1 ? 'data' : 'datas'}`
      : null,
    submitSeries,
    result: isResultVisible ? result : null,
    handlePickAnotherTime,
    handleSingleCreated,
    handleResultDone: onClose,
  };
};
