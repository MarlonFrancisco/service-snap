import { formatCurrency } from '../../../../utils/helpers/format.helpers';
import {
  getStoreCurrency,
  getStoreLocale,
  getStoreTimezone,
} from '../../../../utils/helpers/region.helpers';
import {
  buildGoogleCalendarLink,
  formatLongDate,
} from '../../../../utils/helpers/schedule.helpers';
import { getUserFullName } from '../../../../utils/helpers/user.helpers';
import type { Store } from '../store.entity';
import type { Schedule } from './schedule.entity';

export const getBookingServiceNames = (schedules: Schedule[]) =>
  schedules.map(({ service }) => service?.name || 'Serviço').join(', ');

/** Snapshot gravado na reserva: valor do serviço e moeda da loja naquele momento. */
export const buildSchedulePriceSnapshot = (
  price: number | string | null | undefined,
  store: Pick<Store, 'country' | 'currency'>,
) => ({
  price: price == null ? null : Number(price),
  currency: getStoreCurrency(store),
});

/** Preço gravado na reserva; agendamentos antigos (sem snapshot) usam o do serviço. */
export const getSchedulePrice = (schedule: Schedule): number =>
  Number(schedule.price ?? schedule.service?.price ?? 0);

/**
 * Total formatado na moeda da reserva (ou da loja) e no padrão numérico do país
 * da loja: "R$ 50,00", "12,50 €", "$12.50".
 */
export const getBookingPrice = (schedules: Schedule[]) => {
  const total = schedules.reduce(
    (sum, schedule) => sum + getSchedulePrice(schedule),
    0,
  );
  const [first] = schedules;
  const currency = first?.currency || getStoreCurrency(first?.store);

  return total
    ? formatCurrency(total, currency, getStoreLocale(first?.store))
    : 'Sob consulta';
};

const getProfessionalName = (schedule: Schedule) =>
  schedule.storeMember?.user?.firstName || 'Profissional';

/** Dono e profissional podem ser a mesma pessoa: um e-mail só nesse caso. */
export const getStoreRecipients = (schedule: Schedule) => [
  ...new Set(
    [schedule.store?.owner?.email, schedule.storeMember?.user?.email].filter(
      Boolean,
    ),
  ),
];

/** Linhas em ordem de horário: o evento vai do início da primeira ao fim da última. */
export const buildBookingCalendarLink = (schedules: Schedule[]) => {
  const [first] = schedules;

  return buildGoogleCalendarLink({
    title: `${getBookingServiceNames(schedules)} em ${first.store.name || 'Loja'}`,
    date: first.date,
    startTime: first.startTime,
    endTime: schedules[schedules.length - 1].endTime,
    timezone: getStoreTimezone(first.store),
    location: first.store.address || '',
  });
};

export const buildBookingConfirmationData = (
  schedules: Schedule[],
  frontendUrl: string,
) => ({
  ...buildCustomerEmailData(schedules[0]),
  serviceName: getBookingServiceNames(schedules),
  price: getBookingPrice(schedules),
  calendarLink: buildBookingCalendarLink(schedules),
  manageLink: `${frontendUrl}/profile`,
});

export const buildCustomerEmailData = (schedule: Schedule) => ({
  storeName: schedule.store.name || 'Loja',
  customerName: schedule.user?.firstName || 'Cliente',
  serviceName: schedule.service?.name || 'Serviço',
  professionalName: getProfessionalName(schedule),
  scheduleDay: formatLongDate(schedule.date),
  scheduleTime: schedule.startTime,
  storeAddress: schedule.store.address || '',
  storePhone: schedule.store.telephone || '',
});

export const buildStoreEmailData = (
  schedule: Schedule,
  frontendUrl: string,
) => ({
  storeName: schedule.store.name || 'Loja',
  customerName: getUserFullName(schedule.user) || 'Cliente',
  customerPhone: schedule.user?.telephone || '',
  serviceName: schedule.service?.name || 'Serviço',
  professionalName: getProfessionalName(schedule),
  scheduleDay: formatLongDate(schedule.date),
  scheduleTime: schedule.startTime,
  agendaLink: `${frontendUrl}/partner/agenda`,
});
