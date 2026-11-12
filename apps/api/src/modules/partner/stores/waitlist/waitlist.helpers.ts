import type { AvailabilitySlot } from '../../../../utils/helpers/schedule.helpers';
import {
  formatLongDate,
  timeToMinutes,
} from '../../../../utils/helpers/schedule.helpers';
import { getUserFullName } from '../../../../utils/helpers/user.helpers';
import { toParam } from '../whatsapp/whatsapp-reminder-template';
import type { WaitlistEntry } from './waitlist-entry.entity';
import type {
  TWaitlistChannel,
  TWaitlistEntryResponse,
  TWaitlistNotice,
} from './waitlist.types';

const WAITLIST_PREFIX = 'waitlist';

export const WAITLIST_RELATIONS = [
  'store',
  'user',
  'service',
  'storeMember',
  'storeMember.user',
];

/** Quantos dias à frente dá para entrar na fila: o mesmo horizonte do bot. */
export const WAITLIST_HORIZON_DAYS = 60;

/** Filas abertas de um cliente na mesma loja. */
export const WAITLIST_MAX_ACTIVE_PER_CUSTOMER = 5;

/** Quantos horários livres o aviso cita. */
const NOTICE_FREE_TIMES = 3;

/**
 * Horários que um cancelamento ainda poderia liberar: os que cabem antes do
 * fechamento e, hoje, os que ainda não passaram. Dia sem nenhum não tem fila.
 */
export const countFreeableSlots = (
  slots: Pick<AvailabilitySlot, 'time'>[],
  {
    date,
    today,
    nowMinutes,
    closeTime,
    durationMinutes,
  }: {
    date: string;
    today: string;
    nowMinutes: number;
    closeTime?: string | null;
    durationMinutes: number;
  },
) =>
  slots.filter((slot) => {
    const start = timeToMinutes(slot.time);
    const fits =
      !closeTime || start + durationMinutes <= timeToMinutes(closeTime);
    return fits && (date !== today || start > nowMinutes);
  }).length;

/** Payload do botão "Ver horários": volta no webhook com a entrada junto. */
export const buildWaitlistPayload = (entryId: string) =>
  `${WAITLIST_PREFIX}:${entryId}`;

export const parseWaitlistPayload = (payload?: string | null) => {
  const [prefix, entryId] = (payload ?? '').split(':');

  return prefix === WAITLIST_PREFIX && entryId ? entryId : null;
};

/** Ordem de tentativa: o canal da entrada primeiro, depois o outro. */
export const getWaitlistChannels = (
  preferred: TWaitlistChannel,
): TWaitlistChannel[] =>
  preferred === 'whatsapp' ? ['whatsapp', 'email'] : ['email', 'whatsapp'];

const joinTimes = (times: string[]) =>
  times.length > 1
    ? `${times.slice(0, -1).join(', ')} e ${times.at(-1)}`
    : times[0] ?? '';

export const buildWaitlistNotice = (
  entry: WaitlistEntry,
  slots: AvailabilitySlot[],
  bookingLink: string,
): TWaitlistNotice => ({
  customerName: entry.user?.firstName || 'Cliente',
  storeName: entry.store?.name || 'Loja',
  scheduleDay: formatLongDate(entry.date),
  serviceName: entry.service?.name || 'Serviço',
  professionalName: entry.storeMember?.user
    ? getUserFullName(entry.storeMember.user)
    : 'Qualquer profissional',
  freeTimes: joinTimes(
    slots
      .filter((slot) => slot.available)
      .slice(0, NOTICE_FREE_TIMES)
      .map((slot) => slot.time),
  ),
  bookingLink,
});

export const toWaitlistEntryResponse = (
  entry: WaitlistEntry,
): TWaitlistEntryResponse => ({
  id: entry.id,
  date: entry.date,
  status: entry.status,
  channel: entry.channel,
  service: {
    id: entry.service?.id,
    name: entry.service?.name,
    duration: entry.service?.duration,
  },
  storeMember: entry.storeMember
    ? {
        id: entry.storeMember.id,
        name: getUserFullName(entry.storeMember.user),
      }
    : null,
});

/** Valores na ordem de {{1}} a {{5}} do template `servicesnap_vaga_liberada`. */
export const buildWaitlistTemplateParams = (notice: TWaitlistNotice) => [
  toParam(notice.customerName, 'Cliente'),
  toParam(notice.storeName, 'Loja'),
  toParam(notice.scheduleDay, '-'),
  toParam(notice.serviceName, 'Serviço'),
  toParam(notice.professionalName, 'Qualquer profissional'),
];

/**
 * Mesmo aviso em mensagem livre, para quando o template ainda não foi aprovado.
 * A Meta só entrega se o cliente falou com a loja nas últimas 24 horas.
 */
export const buildWaitlistWhatsappText = (notice: TWaitlistNotice) =>
  [
    `🔔 *Vagou um horário em ${notice.storeName}!*`,
    '',
    `📅 ${notice.scheduleDay}`,
    `📌 ${notice.serviceName}`,
    `👤 ${notice.professionalName}`,
    ...(notice.freeTimes ? [`🕐 Livres agora: ${notice.freeTimes}`] : []),
    '',
    'A vaga fica com quem reservar primeiro. Toque abaixo para ver os horários.',
  ].join('\n');
