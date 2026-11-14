import {
  formatLongDate,
  toDateKey,
} from '../../utils/helpers/schedule.helpers';
import { getUserFullName } from '../../utils/helpers/user.helpers';
import { normalizeText } from '../../utils/helpers/whatsapp.helpers';
import type { TPresenceAnswer } from '../partner/stores/schedule/schedule-presence.types';
import type { Schedule } from '../partner/stores/schedule/schedule.entity';
import type { IBotAppointment } from './whatsapp-bot.types';

const PRESENCE_YES = [
  'sim',
  's',
  'confirmo',
  'confirmado',
  'confirmar',
  'vou',
  'sim vou',
  'sim confirmo',
];
const PRESENCE_NO = ['nao', 'n', 'nao vou', 'nao posso', 'nao vou poder'];

/** "Sim" ou "não" digitado em resposta ao lembrete, em vez de tocar no botão. */
export const parseTypedPresence = (text: string): TPresenceAnswer | null => {
  const normalized = normalizeText(text)
    .replace(/[!?.,]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (PRESENCE_YES.includes(normalized)) return 'yes';
  if (PRESENCE_NO.includes(normalized)) return 'no';

  return null;
};

/** Agendamento como a conversa guarda, para listar, remarcar e cancelar. */
export const toBotAppointment = (schedule: Schedule): IBotAppointment => ({
  id: schedule.id,
  customerId: schedule.user?.id,
  date: toDateKey(schedule.date),
  time: schedule.startTime,
  service: {
    id: schedule.service?.id,
    name: schedule.service?.name ?? 'Atendimento',
    duration: schedule.service?.duration ?? 0,
    price: schedule.service?.price,
  },
  professional: {
    id: schedule.storeMember?.id,
    name: schedule.storeMember?.user
      ? getUserFullName(schedule.storeMember.user)
      : '',
  },
});

export const buildPresenceConfirmedText = (
  appointment: IBotAppointment,
  address?: string,
) =>
  [
    '✅ *Presença confirmada!*',
    '',
    `📌 ${appointment.service.name}`,
    ...(appointment.professional.name
      ? [`👤 ${appointment.professional.name}`]
      : []),
    `📅 ${formatLongDate(appointment.date)} às ${appointment.time}`,
    ...(address ? [`📍 ${address}`] : []),
    '',
    'Te esperamos! 😊',
    'Se mudar de ideia, é só mandar *menu* para remarcar ou cancelar.',
  ].join('\n');

export const buildWaitlistJoinedText = ({
  serviceName,
  professionalName,
  date,
}: {
  serviceName: string;
  professionalName?: string;
  date: string;
}) =>
  [
    '🔔 *Você está na lista de espera!*',
    '',
    `📌 ${serviceName}`,
    `👤 ${professionalName || 'Qualquer profissional'}`,
    `📅 ${formatLongDate(date)}`,
    '',
    'Se vagar um horário nesse dia, eu te aviso por aqui. A vaga fica com quem reservar primeiro.',
  ].join('\n');
