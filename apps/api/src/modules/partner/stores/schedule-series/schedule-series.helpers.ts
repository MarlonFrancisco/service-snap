import { addDaysToDateKey } from '../../../../utils/helpers/store-date.helpers';

export const MAX_SERIES_OCCURRENCES = 12;
// Seis meses: além disso a agenda da loja (folgas, preços) muda demais
export const MAX_SERIES_SPAN_DAYS = 183;

/** Datas da série a partir da primeira, a cada `intervalWeeks` semanas. */
export const buildSeriesDates = (
  startDate: string,
  intervalWeeks: number,
  occurrences: number,
): string[] =>
  Array.from({ length: occurrences }, (_, index) =>
    addDaysToDateKey(startDate, index * intervalWeeks * 7),
  );

export const seriesSpanDays = (dates: string[]) =>
  (Date.parse(dates[dates.length - 1]) - Date.parse(dates[0])) / 86_400_000;
