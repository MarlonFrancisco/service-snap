import { ForbiddenException } from '@nestjs/common';
import { formatCurrency } from '../../../../utils/helpers/format.helpers';
import {
  getStoreCurrency,
  getStoreLocale,
  getStoreTimezone,
} from '../../../../utils/helpers/region.helpers';
import {
  buildGoogleCalendarLink,
  calculateEndTime,
  formatLongDate,
  storeTimeToDate,
  timeToMinutes,
  toDateKey,
} from '../../../../utils/helpers/schedule.helpers';
import { getUserFullName } from '../../../../utils/helpers/user.helpers';
import type { Store } from '../store.entity';
import type { Schedule } from './schedule.entity';
import { SCHEDULE_POLICY_CODE, type TPolicyAction } from './schedule.types';

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

/** Mesmas pessoas de `getStoreRecipients`, por id, para o push. */
export const getStoreRecipientUserIds = (schedule: Schedule) => [
  ...new Set(
    [schedule.store?.owner?.id, schedule.storeMember?.user?.id].filter(
      Boolean,
    ),
  ),
];

/** "Corte · Ana · Quarta-feira, 4 de novembro às 10:00" */
export const buildStorePushBody = (
  schedule: Schedule,
  serviceNames = schedule.service?.name || 'Serviço',
) =>
  [
    serviceNames,
    schedule.user?.firstName?.trim(),
    `${formatLongDate(schedule.date)} às ${schedule.startTime}`,
  ]
    .filter(Boolean)
    .join(' · ');

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

const POLICY_LABEL: Record<TPolicyAction, string> = {
  cancel: 'cancelar',
  reschedule: 'remarcar',
};

/**
 * Política da loja para o cliente: só cancela ou remarca até `noticeHours` antes
 * do início, e nunca depois que o atendimento começou. A loja não passa por aqui.
 */
export function assertWithinNotice(
  action: TPolicyAction,
  store: Pick<
    Store,
    'timezone' | 'country' | 'cancellationNoticeHours' | 'rescheduleNoticeHours'
  >,
  first: Pick<Schedule, 'date' | 'startTime'>,
  now = new Date(),
) {
  const noticeHours =
    (action === 'cancel'
      ? store.cancellationNoticeHours
      : store.rescheduleNoticeHours) ?? 0;
  const startsAt = storeTimeToDate(
    toDateKey(first.date),
    first.startTime,
    getStoreTimezone(store),
  );
  const deadline = startsAt.getTime() - noticeHours * 3_600_000;

  if (now.getTime() < deadline) return;

  throw new ForbiddenException({
    statusCode: 403,
    error: 'Forbidden',
    code: SCHEDULE_POLICY_CODE,
    action,
    noticeHours,
    message: noticeHours
      ? `Pela política da loja, só dá para ${POLICY_LABEL[action]} até ${noticeHours}h antes do horário.`
      : `Não dá para ${POLICY_LABEL[action]} um atendimento que já começou.`,
  });
}

/**
 * Novos horários de um grupo que começa em `startTime`: cada serviço mantém a
 * distância do primeiro e a duração reservada, mesmo que o serviço mude depois.
 */
export function shiftItems(
  items: Pick<Schedule, 'id' | 'startTime' | 'endTime'>[],
  startTime: string,
) {
  const origin = timeToMinutes(items[0].startTime);
  const delta = timeToMinutes(startTime) - origin;

  return items.map((item) => {
    const start = timeToMinutes(item.startTime) + delta;
    const duration = timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
    const nextStart = calculateEndTime('00:00', start);

    return {
      id: item.id,
      startTime: nextStart,
      endTime: calculateEndTime(nextStart, duration),
    };
  });
}
