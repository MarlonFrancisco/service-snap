import { formatCurrency } from '../../../../utils/helpers/format.helpers';
import {
  buildGoogleCalendarLink,
  formatLongDate,
} from '../../../../utils/helpers/schedule.helpers';
import { getUserFullName } from '../../../../utils/helpers/user.helpers';
import type { Schedule } from './schedule.entity';

export const getBookingServiceNames = (schedules: Schedule[]) =>
  schedules.map(({ service }) => service?.name || 'Serviço').join(', ');

export const getBookingPrice = (schedules: Schedule[]) => {
  const total = schedules.reduce(
    (sum, { service }) => sum + Number(service?.price ?? 0),
    0,
  );

  return total ? formatCurrency(total) : 'Sob consulta';
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
    timezone: first.store.timezone || 'America/Sao_Paulo',
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
