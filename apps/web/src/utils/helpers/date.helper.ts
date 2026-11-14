const LOCALE = 'pt-BR';

const WEEKDAY_LONG = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  timeZone: 'UTC',
});
const WEEKDAY_SHORT = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'short',
  timeZone: 'UTC',
});
const MONTH_LONG = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  timeZone: 'UTC',
});

const capitalize = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

const padTwoDigits = (value: number) => String(value).padStart(2, '0');

/**
 * Dia `YYYY-MM-DD` (ou ISO) lido como UTC: formatado também em UTC, mantém o
 * mesmo dia em qualquer fuso, no servidor e no cliente.
 */
export const parseDateKey = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Ex.: "Sábado, 7 de novembro" e "Segunda, 9 de novembro". */
export const formatDateKeyLong = (value: string) => {
  const date = parseDateKey(value);
  if (!date) return value;

  const weekday = WEEKDAY_LONG.format(date).replace('-feira', '');
  return `${capitalize(weekday)}, ${date.getUTCDate()} de ${MONTH_LONG.format(date)}`;
};

/** Ex.: "Sáb, 07/11". */
export const formatDateKeyShort = (value: string) => {
  const date = parseDateKey(value);
  if (!date) return value;

  const weekday = WEEKDAY_SHORT.format(date).replace('.', '');
  return `${capitalize(weekday)}, ${padTwoDigits(date.getUTCDate())}/${padTwoDigits(date.getUTCMonth() + 1)}`;
};
