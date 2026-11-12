import type { TBlockTimeSchema } from './block-time.schema';

type TApiDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const addDays = (date: string, days: number): string => {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  const month = String(next.getMonth() + 1).padStart(2, '0');
  const day = String(next.getDate()).padStart(2, '0');
  return `${next.getFullYear()}-${month}-${day}`;
};

/**
 * Um item por dia, de "De" até "Até". Dia inteiro vai de 00:00 a 24:00; o
 * semanal leva o dia da semana no padrão da API (domingo é 0).
 */
export const buildBlockedTimeItems = (values: TBlockTimeSchema) => {
  const lastDay = values.to || values.from;
  const dayCount =
    Math.round(
      (new Date(`${lastDay}T12:00:00`).getTime() -
        new Date(`${values.from}T12:00:00`).getTime()) /
        (24 * 60 * 60 * 1000),
    ) + 1;
  const dates = Array.from({ length: Math.max(dayCount, 1) }, (_, index) =>
    addDays(values.from, index),
  );

  return dates.map((date) => ({
    date,
    time: values.isFullDay ? '00:00' : values.startTime,
    endTime: values.isFullDay ? '24:00' : values.endTime,
    isRecurring: values.isRecurring,
    dayOfWeek: new Date(`${date}T12:00:00`).getDay() as TApiDayOfWeek,
  }));
};
