import { randomBytes } from 'crypto';
import { getStoreTimezone } from '../../../../utils/helpers/region.helpers';
import {
  storeTimeToDate,
  toDateKey,
} from '../../../../utils/helpers/schedule.helpers';
import type { Schedule } from '../schedule/schedule.entity';
import type { TCalendarFeedEvent } from './calendar-feed.types';

/** 24 bytes aleatórios: impossível de adivinhar, e cabe numa URL. */
export const generateCalendarToken = () => randomBytes(24).toString('base64url');

/** O link passa pelo `/api` do web, que já repassa para a API. */
export const buildCalendarFeedUrl = (frontendUrl: string, token: string) =>
  `${frontendUrl.replace(/\/$/, '')}/api/calendar/${token}.ics`;

/** Instante em UTC no formato do iCalendar: 20261112T130000Z. */
const formatIcsDate = (date: Date) =>
  date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Vírgula, ponto e vírgula, barra e quebra de linha têm significado no formato. */
const escapeIcsText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

/** O formato limita a linha a 75 bytes; as seguintes começam com espaço. */
const foldIcsLine = (line: string) => {
  const parts: string[] = [];
  let rest = line;

  while (Buffer.byteLength(rest) > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut)) > 75) cut -= 1;
    parts.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }

  return [...parts, rest].join('\r\n');
};

/**
 * Atendimento vira evento com horário em UTC, convertido do fuso da loja: o
 * calendário mostra no fuso de quem olha. Leva o primeiro nome do cliente e o
 * serviço, nada de telefone ou e-mail, porque o link vai para outro serviço.
 */
export const toCalendarFeedEvent = (
  schedule: Schedule,
  agendaUrl: string,
): TCalendarFeedEvent => {
  const timezone = getStoreTimezone(schedule.store);
  const date = toDateKey(schedule.date);
  const customer = schedule.user?.firstName?.trim();

  return {
    uid: `${schedule.id}@servicesnap`,
    start: storeTimeToDate(date, schedule.startTime, timezone),
    end: storeTimeToDate(date, schedule.endTime, timezone),
    summary: [schedule.service?.name || 'Atendimento', customer]
      .filter(Boolean)
      .join(' · '),
    description: `Agendado pelo ServiceSnap. Detalhes na agenda: ${agendaUrl}`,
    location: schedule.store?.address || schedule.store?.name || '',
    updatedAt: schedule.updatedAt ?? schedule.createdAt,
  };
};

export const buildIcsCalendar = (
  name: string,
  events: TCalendarFeedEvent[],
): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ServiceSnap//Agenda//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(name)}`,
    // Pede ao app de calendário para buscar de novo a cada hora (o Google decide o próprio ritmo)
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
    ...events.flatMap((event) => [
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${formatIcsDate(event.updatedAt)}`,
      `LAST-MODIFIED:${formatIcsDate(event.updatedAt)}`,
      `DTSTART:${formatIcsDate(event.start)}`,
      `DTEND:${formatIcsDate(event.end)}`,
      `SUMMARY:${escapeIcsText(event.summary)}`,
      `DESCRIPTION:${escapeIcsText(event.description)}`,
      `LOCATION:${escapeIcsText(event.location)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
  ];

  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
};
