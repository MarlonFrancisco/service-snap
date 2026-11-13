import { isApiHttpError } from '@/service/api';
import type { TSeriesIntervalWeeks } from '@/types/api/schedule-series.types';
import { getCreateAppointmentErrorMessage } from '../agenda-module/components/add-appointment-responsive/add-appointment.helpers';
import type { TSeriesIntervalOption } from './schedule-series-module.types';

/** Mesmos limites da API (`schedule-series.helpers.ts`). */
export const MIN_SERIES_OCCURRENCES = 2;
export const MAX_SERIES_OCCURRENCES = 12;
export const MAX_SERIES_SPAN_DAYS = 183;
export const DEFAULT_SERIES_OCCURRENCES = 4;

export const SERIES_INTERVAL_OPTIONS: TSeriesIntervalOption[] = [
  { value: 1, label: 'Toda semana' },
  { value: 2, label: 'A cada 2 semanas' },
  { value: 3, label: 'A cada 3 semanas' },
  { value: 4, label: 'A cada 4 semanas' },
];

const SHORT_WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const LONG_WEEKDAYS = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
];

const parseDateKey = (dateKey: string) => {
  const [year = 0, month = 1, day = 1] = dateKey
    .slice(0, 10)
    .split('-')
    .map(Number);

  return { year, month, day };
};

/** Conta em UTC: o fuso do navegador não muda o dia. */
const toUtcDate = (dateKey: string, plusDays = 0) => {
  const { year, month, day } = parseDateKey(dateKey);

  return new Date(Date.UTC(year, month - 1, day + plusDays));
};

export const addDaysToDateKey = (dateKey: string, days: number) =>
  toUtcDate(dateKey, days).toISOString().slice(0, 10);

/** Mais vezes do que isso passa de 6 meses na frequência escolhida. */
export const getMaxOccurrences = (intervalWeeks: TSeriesIntervalWeeks) =>
  Math.min(
    MAX_SERIES_OCCURRENCES,
    Math.floor(MAX_SERIES_SPAN_DAYS / (intervalWeeks * 7)) + 1,
  );

/** Datas da série a partir da primeira, a cada `intervalWeeks` semanas. */
export const buildSeriesDates = (
  startDate: string,
  intervalWeeks: TSeriesIntervalWeeks,
  occurrences: number,
) =>
  Array.from({ length: occurrences }, (_, index) =>
    addDaysToDateKey(startDate, index * intervalWeeks * 7),
  );

/** "2026-11-16" → "Seg, 16/11". */
export const formatSeriesDay = (dateKey: string) => {
  const { month, day } = parseDateKey(dateKey);
  const weekday = SHORT_WEEKDAYS[toUtcDate(dateKey).getUTCDay()] ?? '';

  return `${weekday}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
};

const getLongWeekday = (dateKey: string) =>
  LONG_WEEKDAYS[toUtcDate(dateKey).getUTCDay()] ?? '';

/** "toda semana" ou "a cada 2 semanas", para o meio da frase. */
export const formatSeriesFrequency = (intervalWeeks: number) =>
  intervalWeeks === 1 ? 'toda semana' : `a cada ${intervalWeeks} semanas`;

/** "Toda semana, segunda às 16:00, com Ana." */
export const formatSeriesRule = ({
  intervalWeeks,
  date,
  time,
  professionalName,
}: {
  intervalWeeks: number;
  date: string;
  time: string;
  professionalName: string;
}) => {
  const frequency = formatSeriesFrequency(intervalWeeks);
  const sentence = `${frequency.charAt(0).toUpperCase()}${frequency.slice(1)}, ${getLongWeekday(date)} às ${time}`;

  return professionalName
    ? `${sentence}, com ${professionalName}.`
    : `${sentence}.`;
};

const CONFLICT_REASONS = [
  'Professional already has a schedule at this time',
  'This time is not available',
];

/** Motivo da API em uma frase para a equipe. */
export const getSeriesConflictReason = (
  reason: string,
  { professionalName, time }: { professionalName: string; time: string },
) => {
  if (CONFLICT_REASONS.includes(reason)) {
    return `${professionalName || 'O profissional'} já tem atendimento às ${time}`;
  }

  return 'Não deu para agendar nesta data';
};

const SERIES_ERROR_MESSAGES: Record<string, string> = {
  'No date of the series is available':
    'Nenhuma data da série está livre neste horário. Escolha outro horário ou outra frequência.',
  'Series cannot start in the past': 'A primeira data não pode ser no passado.',
  'Series cannot span more than 6 months':
    'A série precisa caber em 6 meses. Diminua as vezes ou a frequência.',
};

export const getCreateSeriesErrorMessage = (error: unknown) =>
  (isApiHttpError(error) && SERIES_ERROR_MESSAGES[error.message]) ||
  getCreateAppointmentErrorMessage(error);
