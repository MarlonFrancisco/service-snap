import type { IStore, TWorkingDays } from '@/types/api/stores.types';
import { formatBookingDateLong } from '../utils/bookings-section.helpers';
import type { TProfileVisit } from '../bookings-section.types';
import type { TRescheduleDay } from './reschedule-dialog.types';

export const WEEK_LENGTH = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const WEEKDAY_KEYS: (keyof TWorkingDays)[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];
const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_LONG = new Intl.DateTimeFormat('pt-BR', { month: 'long' });

type TStoreCalendar = Pick<IStore, 'businessDays' | 'maxAdvanceDays'>;

/** Hoje, à meia-noite do fuso do navegador. */
export const startOfToday = (now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate());

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** Dia `YYYY-MM-DD` no fuso do navegador. */
export const toDateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const fromDateKey = (key: string) => {
  const [year = 0, month = 1, day = 1] = key
    .slice(0, 10)
    .split('-')
    .map(Number);
  return new Date(year, month - 1, day);
};

const daysBetween = (from: Date, to: Date) =>
  Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);

/** Semana (a partir de hoje) em que cai a data da visita. */
export const getWeekOffsetFor = (dateKey: string, today: Date) =>
  Math.max(
    0,
    Math.floor(daysBetween(today, fromDateKey(dateKey)) / WEEK_LENGTH),
  );

/** Sete dias a partir de hoje + `weekOffset` semanas; fechado e passado ficam de fora. */
export const buildRescheduleDays = ({
  today,
  weekOffset,
  store,
}: {
  today: Date;
  weekOffset: number;
  store: TStoreCalendar;
}): TRescheduleDay[] =>
  Array.from({ length: WEEK_LENGTH }, (_, index) => {
    const date = addDays(today, weekOffset * WEEK_LENGTH + index);
    const isClosed =
      store.businessDays?.[WEEKDAY_KEYS[date.getDay()]!] === false;
    const maxAdvanceDays = store.maxAdvanceDays ?? 0;
    const isTooFar =
      maxAdvanceDays > 0 && daysBetween(today, date) > maxAdvanceDays;
    const weekday = WEEKDAY_SHORT[date.getDay()]!;

    return {
      key: toDateKey(date),
      weekday,
      day: date.getDate(),
      label: `${weekday}, ${date.getDate()} de ${MONTH_LONG.format(date)}${isClosed ? ', loja fechada' : ''}`,
      isDisabled: isClosed || isTooFar,
    };
  });

/** Ainda há dia marcável na próxima semana. */
export const hasNextWeek = (weekOffset: number, store: TStoreCalendar) => {
  const maxAdvanceDays = store.maxAdvanceDays ?? 0;
  return (
    maxAdvanceDays === 0 || (weekOffset + 1) * WEEK_LENGTH <= maxAdvanceDays
  );
};

/** Ex.: "Horário atual: quarta, 4 de novembro · 10:30". */
export const formatCurrentVisitTime = ({
  appointment,
  startTime,
}: TProfileVisit) => {
  const date = formatBookingDateLong(appointment.date);
  return `Horário atual: ${date.charAt(0).toLowerCase()}${date.slice(1)} · ${startTime}`;
};
