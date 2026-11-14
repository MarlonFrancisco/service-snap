import type {
  THolidayItem,
  THolidaysSource,
  THolidayYearGroup,
} from './holidays-tab.types';

/** Data local em YYYY-MM-DD (o `toISOString` puxaria para UTC). */
export const toLocalDateKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
};

/** YYYY-MM-DD como data local, sem o deslocamento de fuso do `new Date(iso)`. */
const fromDateKey = (dateKey: string): Date => {
  const [year = 0, month = 1, day = 1] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
};

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

const getDayOfMonthLabel = (day: number) => (day === 1 ? '1º' : String(day));

const toHolidayItem = (
  holiday: THolidaysSource[number],
  currentYear: number,
): THolidayItem => {
  const date = fromDateKey(holiday.date);
  const weekday = date
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '');
  const month = date.toLocaleDateString('pt-BR', { month: 'long' });
  const monthShort = date
    .toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '');
  const dayAndMonth = `${getDayOfMonthLabel(date.getDate())} de ${month}`;
  const removeTarget =
    date.getFullYear() === currentYear
      ? dayAndMonth
      : `${dayAndMonth} de ${date.getFullYear()}`;

  return {
    id: holiday.id,
    dayLabel: String(date.getDate()),
    monthShortLabel: monthShort,
    dateLabel: `${capitalize(weekday)}, ${dayAndMonth}`,
    name: holiday.name?.trim() || 'Sem nome',
    removeLabel: `Remover feriado de ${removeTarget}`,
  };
};

/** Ordena por data e separa por ano, como a lista do desenho. */
export const groupHolidaysByYear = (
  holidays: THolidaysSource,
  currentYear: number,
): THolidayYearGroup[] => {
  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

  return sorted.reduce<THolidayYearGroup[]>((groups, holiday) => {
    const year = Number(holiday.date.slice(0, 4));
    const item = toHolidayItem(holiday, currentYear);
    const last = groups.at(-1);

    if (last?.year === year) {
      return [...groups.slice(0, -1), { ...last, items: [...last.items, item] }];
    }

    return [...groups, { year, items: [item] }];
  }, []);
};
