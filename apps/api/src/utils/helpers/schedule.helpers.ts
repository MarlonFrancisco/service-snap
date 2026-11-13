import type { Schedule } from '../../modules/partner/stores/schedule/schedule.entity';
import type {
  TAvailabilityMember,
  TBlockedRange,
  TCalendarEvent,
  TDayHours,
  TScheduleRules,
  TWeekDay,
  TWorkingHours,
} from './schedule.types';
import { getStoreTimezone } from './region.helpers';

export const calculateEndTime = (
  startTime: string,
  durationMinutes: number,
): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

export interface TimeSlot {
  time: string; // formato HH:MM
  available: boolean;
}

/**
 * Converte string de tempo HH:MM em minutos desde meia-noite
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converte minutos desde meia-noite em string HH:MM
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Gera todos os slots de tempo possíveis baseado no horário de funcionamento
 */
export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  lunchStartTime?: string | null,
  lunchEndTime?: string | null,
  intervalMinutes: number = 30,
): string[] {
  const slots: string[] = [];
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);
  const lunchStart = lunchStartTime ? timeToMinutes(lunchStartTime) : null;
  const lunchEnd = lunchEndTime ? timeToMinutes(lunchEndTime) : null;

  let currentMinutes = openMinutes;

  while (currentMinutes < closeMinutes) {
    // Pula horário de almoço
    if (lunchStart !== null && lunchEnd !== null) {
      if (currentMinutes >= lunchStart && currentMinutes < lunchEnd) {
        currentMinutes += intervalMinutes;
        continue;
      }
    }

    slots.push(minutesToTime(currentMinutes));
    currentMinutes += intervalMinutes;
  }

  return slots;
}

/** Bloqueio antigo guarda só o início de um slot da grade fixa de 30 minutos. */
export const LEGACY_BLOCK_MINUTES = 30;

export const DEFAULT_SLOT_INTERVAL_MINUTES = 30;

const MINUTES_PER_DAY = 24 * 60;

export const WEEK_DAYS: TWeekDay[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

/** Dia da semana de uma data YYYY-MM-DD, sem depender do fuso do servidor. */
export const weekDayOf = (date: string): TWeekDay =>
  WEEK_DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];

/** Dias corridos entre duas datas YYYY-MM-DD. */
export const daysBetween = (from: string, to: string): number =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      (MINUTES_PER_DAY * 60_000),
  );

/** Início e fim do bloqueio em minutos. */
export function blockedRangeMinutes(
  blocked: Pick<TBlockedRange, 'time' | 'endTime'>,
): [number, number] {
  const start = timeToMinutes(blocked.time);
  const end = blocked.endTime
    ? timeToMinutes(blocked.endTime)
    : start + LEGACY_BLOCK_MINUTES;

  return [start, end];
}

function blockAppliesOn(blocked: TBlockedRange, date: string): boolean {
  // O enum do Postgres devolve o dia da semana como texto ("2"), daí o Number
  return blocked.isRecurring
    ? WEEK_DAYS[Number(blocked.dayOfWeek)] === weekDayOf(date)
    : toDateKey(blocked.date) === date;
}

/**
 * Profissional livre em [start, end) no dia: sem bloqueio cruzando e sem
 * atendimento a menos de `bufferMinutes` antes ou depois.
 */
function isMemberFree(
  {
    blockedTimes,
    schedules,
  }: Pick<TAvailabilityMember, 'blockedTimes' | 'schedules'>,
  date: string,
  start: number,
  end: number,
  bufferMinutes = 0,
): boolean {
  const isBlocked = blockedTimes.some((blocked) => {
    if (!blockAppliesOn(blocked, date)) return false;

    const [blockStart, blockEnd] = blockedRangeMinutes(blocked);

    return blockStart < end && blockEnd > start;
  });

  if (isBlocked) return false;

  return !schedules.some(
    (schedule) =>
      schedule.status !== 'cancelled' &&
      toDateKey(schedule.date) === date &&
      timeToMinutes(schedule.startTime) < end + bufferMinutes &&
      timeToMinutes(schedule.endTime) + bufferMinutes > start,
  );
}

/**
 * Filtra horários disponíveis removendo bloqueados e já agendados.
 * `durationMinutes` considera o atendimento inteiro; sem ele, só o início do slot.
 */
export function filterAvailableTimeSlots(
  allSlots: string[],
  selectedDate: Date,
  blockedTimes: TBlockedRange[],
  schedules: TAvailabilityMember['schedules'],
  durationMinutes: number = 1,
): string[] {
  const date = new Date(selectedDate).toISOString().split('T')[0];

  return allSlots.filter((slot) => {
    const start = timeToMinutes(slot);

    return isMemberFree(
      { blockedTimes, schedules },
      date,
      start,
      start + durationMinutes,
    );
  });
}

/**
 * Expediente do dia: o do profissional, se ele tiver um para esse dia, senão o
 * da loja. `null` é dia sem atendimento.
 */
export function resolveDayHours(
  store: Partial<TDayHours>,
  workingHours: TWorkingHours | null | undefined,
  weekDay: TWeekDay,
): TDayHours | null {
  if (workingHours && weekDay in workingHours) {
    return workingHours[weekDay] ?? null;
  }

  if (!store.openTime || !store.closeTime) return null;

  return {
    openTime: store.openTime,
    closeTime: store.closeTime,
    lunchStartTime: store.lunchStartTime,
    lunchEndTime: store.lunchEndTime,
  };
}

/** O atendimento inteiro cabe no expediente, sem cruzar o almoço. */
function fitsInHours(hours: TDayHours | null, start: number, end: number) {
  if (!hours) return false;

  const lunchStart = hours.lunchStartTime
    ? timeToMinutes(hours.lunchStartTime)
    : null;
  const lunchEnd = hours.lunchEndTime
    ? timeToMinutes(hours.lunchEndTime)
    : null;
  const crossesLunch =
    lunchStart !== null &&
    lunchEnd !== null &&
    start < lunchEnd &&
    end > lunchStart;

  return (
    start >= timeToMinutes(hours.openTime) &&
    end <= timeToMinutes(hours.closeTime) &&
    !crossesLunch
  );
}

export interface AvailabilitySlot extends TimeSlot {
  storeMemberId: string | null;
}

interface AvailabilityParams {
  store: Partial<TDayHours> &
    TScheduleRules & {
      timezone?: string;
      country?: string;
      businessDays?: Partial<Record<TWeekDay, boolean>> | null;
    };
  date: string; // formato YYYY-MM-DD
  durationMinutes: number;
  members: TAvailabilityMember[];
  /** Feriado ou dia fechado da loja: ninguém atende. */
  isHoliday?: boolean;
  now?: Date;
}

/**
 * Data e hora atuais no fuso da loja
 */
export function getStoreNow(timezone: string, now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/**
 * Instante real de uma data e hora digitadas no fuso da loja. A segunda passada
 * corrige o deslocamento quando o horário de verão muda entre as duas datas.
 */
export function storeTimeToDate(
  date: string,
  time: string,
  timezone: string,
): Date {
  const wallClock = Date.parse(`${date}T${time}:00Z`);
  const offsetAt = (instant: number) => {
    const storeNow = getStoreNow(timezone, new Date(instant));

    return (
      Date.parse(`${storeNow.date}T00:00:00Z`) +
      storeNow.minutes * 60_000 -
      instant
    );
  };

  return new Date(wallClock - offsetAt(wallClock - offsetAt(wallClock)));
}

/**
 * Monta os horários de um dia. A grade junta a da loja e a de cada profissional,
 * no passo de `slotIntervalMinutes`. Cada slot livre traz o primeiro membro, na
 * ordem recebida, que está livre e de expediente durante todo o atendimento.
 */
export function buildAvailabilitySlots({
  store,
  date,
  durationMinutes,
  members,
  isHoliday = false,
  now = new Date(),
}: AvailabilityParams): AvailabilitySlot[] {
  const weekDay = weekDayOf(date);
  const storeNow = getStoreNow(getStoreTimezone(store), now);
  const daysAhead = daysBetween(storeNow.date, date);
  const maxAdvanceDays = store.maxAdvanceDays ?? 0;

  if (
    daysAhead < 0 ||
    isHoliday ||
    store.businessDays?.[weekDay] === false ||
    (maxAdvanceDays > 0 && daysAhead > maxAdvanceDays)
  ) {
    return [];
  }

  const step = store.slotIntervalMinutes || DEFAULT_SLOT_INTERVAL_MINUTES;
  const bufferMinutes = store.bufferMinutes ?? 0;
  // Primeiro minuto reservável, contado a partir da meia-noite do dia pedido.
  // Pelo menos 1: o horário que já começou não é oferecido.
  const earliest =
    storeNow.minutes +
    Math.max(1, store.minAdvanceMinutes ?? 0) -
    daysAhead * MINUTES_PER_DAY;
  const memberHours = members.map((member) =>
    resolveDayHours(store, member.workingHours, weekDay),
  );
  const times = [
    ...new Set(
      [resolveDayHours(store, null, weekDay), ...memberHours]
        .filter((hours): hours is TDayHours => !!hours)
        .flatMap((hours) =>
          generateTimeSlots(
            hours.openTime,
            hours.closeTime,
            hours.lunchStartTime,
            hours.lunchEndTime,
            step,
          ),
        ),
    ),
  ].sort();

  return times.map((time) => {
    const start = timeToMinutes(time);
    const end = start + durationMinutes;
    const member =
      start >= earliest
        ? members.find(
            (candidate, index) =>
              fitsInHours(memberHours[index], start, end) &&
              isMemberFree(candidate, date, start, end, bufferMinutes),
          )
        : undefined;

    return { time, available: !!member, storeMemberId: member?.id ?? null };
  });
}

/**
 * Diz se o início pedido é um dos horários que `buildAvailabilitySlots` ofereceria
 */
export function isSlotBookable(
  params: AvailabilityParams,
  startTime: string,
): boolean {
  return buildAvailabilitySlots(params).some(
    (slot) => slot.time === startTime && slot.available,
  );
}

/**
 * Dia YYYY-MM-DD como o TypeORM grava: um Date usa os campos locais
 */
export function toDateKey(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** "Quarta-feira, 4 de novembro": a data não tem fuso, então fixa UTC nos dois lados. */
export function formatLongDate(date: Date | string): string {
  const label = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${toDateKey(date)}T00:00:00Z`));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export const formatScheduleMoment = (
  schedule: Pick<Schedule, 'date' | 'startTime'>,
): string => `${formatLongDate(schedule.date)} às ${schedule.startTime}`;

const compactDateTime = (date: Date | string, time: string) =>
  `${toDateKey(date).replace(/-/g, '')}T${time.replace(':', '')}00`;

export function buildGoogleCalendarLink(event: TCalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${compactDateTime(event.date, event.startTime)}/${compactDateTime(event.date, event.endTime)}`,
    ctz: event.timezone,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}

/**
 * Verifica se algum novo atendimento cruza um agendamento não cancelado
 */
export function hasScheduleConflict(
  existing: Pick<Schedule, 'startTime' | 'endTime' | 'status'>[],
  next: { startTime: string; endTime: string }[],
): boolean {
  return next.some((item) =>
    existing.some(
      (schedule) =>
        schedule.status !== 'cancelled' &&
        timeToMinutes(schedule.startTime) < timeToMinutes(item.endTime) &&
        timeToMinutes(schedule.endTime) > timeToMinutes(item.startTime),
    ),
  );
}
