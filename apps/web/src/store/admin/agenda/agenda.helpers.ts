import type { TWorkingHours } from '@/types/api/stores.types';

export const generateTimeSlots = (workingHours: TWorkingHours): string[] => {
  const slots: string[] = [];
  const [startHour = 0, startMin = 0] = workingHours.openTime
    .split(':')
    .map(Number);
  const [endHour = 0, endMin = 0] = workingHours.closeTime
    .split(':')
    .map(Number);
  // Sem pausa de almoço a API devolve `null`.
  const [lunchStartHour = 0, lunchStartMin = 0] = (
    workingHours.lunchStartTime ?? ''
  )
    .split(':')
    .map(Number);
  const [lunchEndHour = 0, lunchEndMin = 0] = (workingHours.lunchEndTime ?? '')
    .split(':')
    .map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const lunchStartMinutes = lunchStartHour * 60 + lunchStartMin;
  const lunchEndMinutes = lunchEndHour * 60 + lunchEndMin;

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += 30) {
    if (minutes >= lunchStartMinutes && minutes < lunchEndMinutes) {
      continue;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(
      `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
    );
  }

  return slots;
};

export const getWeekDates = (currentWeek: number): Date[] => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() + currentWeek * 7);
  const monday = new Date(weekStart);
  const dayOfWeek = monday.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(monday.getDate() + diff);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    return date;
  });
};

/** Índice do dia na grade: segunda é 0, domingo é 6. */
export const getTodayDayIndex = (today: Date = new Date()): number =>
  (today.getDay() + 6) % 7;

export const formatMonthYear = (date?: Date): string => {
  if (!date) {
    return '';
  }

  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Dia civil em UTC: diferenças em dias não sofrem com o horário de verão. */
const toUtcDay = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

const getMonday = (date: Date): Date => {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - getTodayDayIndex(date));
  return monday;
};

/** Quantas semanas a data está de hoje (0 = semana atual). */
export const getWeekOffsetForDate = (
  date: Date,
  today: Date = new Date(),
): number =>
  Math.round(
    (toUtcDay(getMonday(date)) - toUtcDay(getMonday(today))) / (7 * DAY_MS),
  );

/** Quantos meses a data está do mês atual (0 = mês atual). */
export const getMonthOffsetForDate = (
  date: Date,
  today: Date = new Date(),
): number =>
  (date.getFullYear() - today.getFullYear()) * 12 +
  (date.getMonth() - today.getMonth());

/** Primeiro dia do mês deslocado `currentMonth` meses de hoje. */
export const getMonthStart = (
  currentMonth: number,
  today: Date = new Date(),
): Date => new Date(today.getFullYear(), today.getMonth() + currentMonth, 1);

/**
 * Datas da grade do mês, de segunda a domingo: começa na segunda da semana do
 * dia 1 e cobre semanas inteiras até o último dia do mês.
 */
export const getMonthGridDates = (
  currentMonth: number,
  today: Date = new Date(),
): Date[] => {
  const monthStart = getMonthStart(currentMonth, today);
  const monthEnd = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
  );
  const gridStart = getMonday(monthStart);
  const totalDays =
    Math.round((toUtcDay(monthEnd) - toUtcDay(gridStart)) / DAY_MS) +
    (7 - getTodayDayIndex(monthEnd));

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(date.getDate() + index);
    return date;
  });
};

/** YYYY-MM-DD no fuso local (o `toISOString` usaria UTC). */
export const toDateKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const formatDayMonth = (date: Date, withYear: boolean) =>
  date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    ...(withYear && { year: 'numeric' }),
  });

/** "2 a 8 de novembro de 2026", "30 de novembro a 6 de dezembro de 2026". */
export const formatWeekRange = (dates: Date[]): string => {
  const first = dates[0];
  const last = dates.at(-1);

  if (!first || !last) return '';

  if (first.getFullYear() !== last.getFullYear()) {
    return `${formatDayMonth(first, true)} a ${formatDayMonth(last, true)}`;
  }

  if (first.getMonth() !== last.getMonth()) {
    return `${formatDayMonth(first, false)} a ${formatDayMonth(last, true)}`;
  }

  return `${first.getDate()} a ${formatDayMonth(last, true)}`;
};
