import { isApiHttpError } from '@/service/api';
import {
  SCHEDULE_POLICY_CODE,
  type IAppointment,
  type TAppointmentStatus,
} from '@/types/api/schedule.types';
import { formatStorePrice } from '@/utils/helpers/price.helper';
import type { TProfileVisit } from '../bookings-section.types';

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

export const getProfessionalName = ({ storeMember }: IAppointment) =>
  `${storeMember.user.firstName} ${storeMember.user.lastName}`;

const getVisitKey = ({ booking, id }: IAppointment) => booking?.id ?? id;

/** Mesma loja, dia e profissional, um emendado no outro. */
const continuesVisit = (previous: IAppointment, next: IAppointment) =>
  !previous.booking?.id &&
  !next.booking?.id &&
  previous.store?.id === next.store?.id &&
  previous.date.slice(0, 10) === next.date.slice(0, 10) &&
  previous.storeMember?.id === next.storeMember?.id &&
  previous.endTime.slice(0, 5) === next.startTime.slice(0, 5);

const toVisit = (appointments: IAppointment[]): TProfileVisit => {
  const first = appointments[0]!;
  const last = appointments[appointments.length - 1]!;
  return {
    id: first.id,
    appointment: first,
    appointments,
    serviceNames: appointments.map(({ service }) => service.name).join(', '),
    serviceIds: appointments.map(({ service }) => service.id),
    startTime: first.startTime.slice(0, 5),
    endTime: last.endTime.slice(0, 5),
  };
};

/**
 * Junta numa visita os serviços marcados juntos: pelo `booking.id` quando a
 * API manda, senão pelos horários emendados da mesma loja e profissional.
 */
export const groupVisits = (schedules: IAppointment[]): TProfileVisit[] => {
  const ordered = [...schedules].sort((a, b) =>
    `${a.date.slice(0, 10)} ${a.startTime}`.localeCompare(
      `${b.date.slice(0, 10)} ${b.startTime}`,
    ),
  );

  const groups = ordered.reduce<IAppointment[][]>((visits, appointment) => {
    const byBooking = appointment.booking?.id
      ? visits.find(
          (visit) => getVisitKey(visit[0]!) === appointment.booking!.id,
        )
      : undefined;
    const current = visits[visits.length - 1];
    const previous = current?.[current.length - 1];

    if (byBooking) {
      byBooking.push(appointment);
    } else if (previous && continuesVisit(previous, appointment)) {
      current!.push(appointment);
    } else {
      visits.push([appointment]);
    }
    return visits;
  }, []);

  return groups.map(toVisit);
};

/** Soma o que foi gravado em cada serviço da visita. */
export const formatVisitPrice = ({
  appointments,
  appointment,
}: TProfileVisit) =>
  formatStorePrice(
    appointments.reduce(
      (total, { price, service }) =>
        total + Number(price ?? service.price ?? 0),
      0,
    ),
    appointment.store.currency ?? undefined,
    appointment.store.country ?? undefined,
  );

/** Mensagem do 403 da política da loja; `null` para qualquer outro erro. */
export const getPolicyBlockMessage = (error: unknown) => {
  if (!isApiHttpError(error) || error.status !== 403) return null;
  const body = error.body as { code?: string; message?: string } | null;
  return body?.code === SCHEDULE_POLICY_CODE
    ? body.message ?? error.message
    : null;
};
