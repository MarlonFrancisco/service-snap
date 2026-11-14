import { getStoreTimezone } from './region.helpers';
import type { TRegionSource } from './region.types';
import { getStoreNow } from './schedule.helpers';

/** Dia de hoje (`YYYY-MM-DD`) no fuso da loja. */
export const getStoreToday = (
  store?: TRegionSource | null,
  now = new Date(),
): string => getStoreNow(getStoreTimezone(store), now).date;

/** `YYYY-MM-DD` + dias, sem fuso: validade é um dia de calendário. */
export const addDaysToDateKey = (date: string, days: number): string => {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);

  return next.toISOString().slice(0, 10);
};

/** "2026-11-13" → "13/11/2026", o formato dos textos em português. */
export const formatDateKey = (dateKey: string) =>
  dateKey.split('-').reverse().join('/');
