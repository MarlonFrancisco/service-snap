import {
  cleanPhoneNumber,
  generateWhatsAppLink,
} from '@/utils/helpers/whatsapp.helper';
import { COUNTRIES } from '@repo/shared/constants';
import type {
  TCalendarEvent,
  TStoreContact,
  TStoreNoticePolicy,
} from './booking-confirmation.types';

/** Número nacional mais longo (com DDD) antes de precisar do código do país. */
const MAX_NATIONAL_DIGITS = 11;

const WEEKDAY_LONG = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  timeZone: 'UTC',
});
const MONTH_LONG = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  timeZone: 'UTC',
});

const capitalize = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

/** `2026-11-16` + `10:30` → `20261116T103000` (horário de parede, sem fuso). */
const toCalendarDateTime = (dateKey: string, time: string) =>
  `${dateKey.slice(0, 10).replace(/-/g, '')}T${time.slice(0, 5).replace(':', '')}00`;

/** Data e hora em UTC no formato do iCalendar, para o `DTSTAMP`. */
const toUtcStamp = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

/** Escapa o texto de uma propriedade do iCalendar (RFC 5545, 3.3.11). */
const escapeIcsText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

/** Quebra linhas longas: o iCalendar pede no máximo 75 octetos por linha. */
const foldIcsLine = (line: string) => {
  const chunks = line.match(/.{1,73}/g) ?? [line];
  return chunks.join('\r\n ');
};

/** Deslocamento do fuso na data do evento, ex.: `-0300`. */
const getUtcOffset = (dateKey: string, timeZone: string) => {
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(new Date(`${dateKey.slice(0, 10)}T12:00:00Z`))
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
  const match = name.match(/GMT([+-])(\d{2}):(\d{2})/);
  return match ? `${match[1]}${match[2]}${match[3]}` : '+0000';
};

/** Ex.: "Quarta-feira, 4 de novembro". */
export const formatConfirmationDate = (dateKey: string) => {
  const date = new Date(`${dateKey.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return `${capitalize(WEEKDAY_LONG.format(date))}, ${date.getUTCDate()} de ${MONTH_LONG.format(date)}`;
};

/** Ex.: 30 → "30min", 60 → "1h", 90 → "1h 30min". */
export const formatServiceDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`;
};

/** Link "Adicionar ao Google Agenda" com início e fim no fuso da loja. */
export const buildGoogleCalendarUrl = (event: TCalendarEvent) => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toCalendarDateTime(event.dateKey, event.startTime)}/${toCalendarDateTime(event.dateKey, event.endTime)}`,
    ctz: event.timeZone,
    details: event.description,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
};

/** Arquivo `.ics` do agendamento, com `TZID` e o fuso da loja descrito. */
export const buildIcsFile = (event: TCalendarEvent, now: Date) => {
  const offset = getUtcOffset(event.dateKey, event.timeZone);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ServiceSnap//Agendamento//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    `TZID:${event.timeZone}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    `TZOFFSETFROM:${offset}`,
    `TZOFFSETTO:${offset}`,
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${toUtcStamp(now)}`,
    `DTSTART;TZID=${event.timeZone}:${toCalendarDateTime(event.dateKey, event.startTime)}`,
    `DTEND;TZID=${event.timeZone}:${toCalendarDateTime(event.dateKey, event.endTime)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
};

const formatNotice = (hours = 0) =>
  hours > 0 ? `até ${hours} h antes` : 'até o início do horário';

/** Frase da política da loja; 0 hora quer dizer "até o início". */
export const getNoticePolicySentence = ({
  cancellationNoticeHours = 0,
  rescheduleNoticeHours = 0,
}: TStoreNoticePolicy) =>
  cancellationNoticeHours === rescheduleNoticeHours
    ? `Você pode cancelar e remarcar ${formatNotice(cancellationNoticeHours)} pelo seu perfil.`
    : `Você pode cancelar ${formatNotice(cancellationNoticeHours)} e remarcar ${formatNotice(rescheduleNoticeHours)} pelo seu perfil.`;

/** Link do WhatsApp da loja, com o código do país; `null` sem telefone. */
export const getStoreWhatsAppUrl = ({
  telephone,
  country,
  name,
}: TStoreContact) => {
  const digits = cleanPhoneNumber(telephone ?? '');
  if (!digits) return null;

  const countryCode = cleanPhoneNumber(COUNTRIES[country]?.phoneCode ?? '');
  const number =
    digits.length <= MAX_NATIONAL_DIGITS && countryCode
      ? `${countryCode}${digits}`
      : digits;

  return generateWhatsAppLink(
    number,
    `Olá! Tenho um agendamento em ${name} pelo ServiceSnap.`,
  );
};
