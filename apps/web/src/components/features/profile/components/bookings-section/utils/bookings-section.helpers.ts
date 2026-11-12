import type {
  IAppointment,
  TAppointmentStatus,
} from '@/types/api/schedule.types';
import { formatStorePrice } from '@/utils/helpers/price.helper';

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
const MONTH_SHORT = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  timeZone: 'UTC',
});

/**
 * A API devolve uma data sem horário (`YYYY-MM-DD`). Lida como UTC e formatada
 * em UTC, ela mantém o mesmo dia em qualquer fuso, no servidor e no cliente.
 */
const parseBookingDate = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const capitalize = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

const withoutDot = (value: string) => value.replace('.', '');

const formatDate = (
  value: string | null | undefined,
  format: (date: Date) => string,
) => {
  if (!value) return '';
  const date = parseBookingDate(value);
  return date ? format(date) : value;
};

/** Ex.: "Quarta, 4 de novembro". */
export const formatBookingDateLong = (value: string) =>
  formatDate(value, (date) => {
    const weekday = WEEKDAY_LONG.format(date).replace('-feira', '');
    const month = MONTH_LONG.format(date);
    return `${capitalize(weekday)}, ${date.getUTCDate()} de ${month}`;
  });

/** Ex.: "Qua, 4 de nov". */
export const formatBookingDateShort = (value: string) =>
  formatDate(value, (date) => {
    const weekday = withoutDot(WEEKDAY_SHORT.format(date));
    const month = withoutDot(MONTH_SHORT.format(date));
    return `${capitalize(weekday)}, ${date.getUTCDate()} de ${month}`;
  });

/** Ex.: "4 de novembro de 2026", para o histórico, que atravessa anos. */
export const formatPastBookingDateLong = (value: string) =>
  formatDate(
    value,
    (date) =>
      `${date.getUTCDate()} de ${MONTH_LONG.format(date)} de ${date.getUTCFullYear()}`,
  );

/** Ex.: "4 de nov de 2026". */
export const formatPastBookingDateShort = (value: string) =>
  formatDate(
    value,
    (date) =>
      `${date.getUTCDate()} de ${withoutDot(MONTH_SHORT.format(date))} de ${date.getUTCFullYear()}`,
  );

/** Ex.: "Quarta-feira, 4 de novembro de 2026". */
export const formatBookingDateFull = (value: string) =>
  formatDate(
    value,
    (date) =>
      `${capitalize(WEEKDAY_LONG.format(date))}, ${formatPastBookingDateLong(value)}`,
  );

export const formatBookingPrice = ({ service, store }: IAppointment) =>
  formatStorePrice(
    service.price,
    store.currency ?? undefined,
    store.country ?? undefined,
  );

/** O que entra no histórico: tudo que não está mais marcado. */
export const HISTORY_STATUSES: TAppointmentStatus[] = [
  'completed',
  'cancelled',
  'no-show',
];

const HISTORY_BADGES: Partial<
  Record<TAppointmentStatus, { label: string; className: string }>
> = {
  completed: { label: 'Concluído', className: 'bg-white text-[#0B0B0F]' },
  cancelled: { label: 'Cancelado', className: 'bg-white text-[#5F5C6E]' },
  'no-show': {
    label: 'Não compareceu',
    className: 'bg-[#FDECEC] text-[#A11A12]',
  },
};

export const getHistoryBadge = ({ status }: IAppointment) =>
  HISTORY_BADGES[status] ?? HISTORY_BADGES.completed!;

/** Só quem foi atendido avalia. */
export const canReviewBooking = ({ status }: IAppointment) =>
  status === 'completed';

export const getProfessionalName =({ storeMember }: IAppointment) =>
  `${storeMember.user.firstName} ${storeMember.user.lastName}`;
