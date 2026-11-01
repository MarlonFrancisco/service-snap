import type { Schedule } from '../../modules/partner/stores/schedule/schedule.entity';
import type { BlockedTime } from '../../modules/partner/stores/store-member/blocked-time/blocked-time.entity';

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
function timeToMinutes(time: string): number {
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
  lunchStartTime?: string,
  lunchEndTime?: string,
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

/**
 * Filtra horários disponíveis removendo bloqueados e já agendados.
 * `durationMinutes` considera o atendimento inteiro; sem ele, só o início do slot.
 */
export function filterAvailableTimeSlots(
  allSlots: string[],
  selectedDate: Date,
  blockedTimes: BlockedTime[],
  schedules: Schedule[],
  durationMinutes: number = 1,
): string[] {
  const selectedDayOfWeek = new Date(selectedDate).getDay();
  const selectedDateStr = new Date(selectedDate).toISOString().split('T')[0];

  return allSlots.filter((slot) => {
    const slotStart = timeToMinutes(slot);
    const slotEnd = slotStart + durationMinutes;

    const isWithinSlot = (time: string) => {
      const minutes = timeToMinutes(time);
      return minutes >= slotStart && minutes < slotEnd;
    };

    // Verifica se está bloqueado para esta data específica
    const isBlockedForDate = blockedTimes.some(
      (blocked) =>
        !blocked.isRecurring &&
        new Date(blocked.date).toISOString().split('T')[0] ===
          selectedDateStr &&
        isWithinSlot(blocked.time),
    );

    if (isBlockedForDate) return false;

    // Verifica se está bloqueado recorrentemente para este dia da semana
    const isBlockedRecurring = blockedTimes.some(
      (blocked) =>
        blocked.isRecurring &&
        blocked.dayOfWeek === selectedDayOfWeek &&
        isWithinSlot(blocked.time),
    );

    if (isBlockedRecurring) return false;

    // Verifica se já existe agendamento neste horário
    const hasSchedule = schedules.some((schedule) => {
      if (schedule.status === 'cancelled') return false;

      const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
      if (scheduleDate !== selectedDateStr) return false;

      // Verifica se o slot cruza o intervalo do agendamento
      return (
        timeToMinutes(schedule.startTime) < slotEnd &&
        timeToMinutes(schedule.endTime) > slotStart
      );
    });

    return !hasSchedule;
  });
}

export interface AvailabilitySlot extends TimeSlot {
  storeMemberId: string | null;
}

interface AvailabilityParams {
  store: {
    openTime: string;
    closeTime: string;
    lunchStartTime?: string;
    lunchEndTime?: string;
    timezone?: string;
    businessDays?: Record<string, boolean>;
  };
  date: string; // formato YYYY-MM-DD
  durationMinutes: number;
  members: {
    id: string;
    blockedTimes: BlockedTime[];
    schedules: Schedule[];
  }[];
  now?: Date;
}

const WEEK_DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

/**
 * Data e hora atuais no fuso da loja
 */
function getStoreNow(timezone: string, now: Date) {
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
 * Monta os horários de um dia. Cada slot livre traz o primeiro membro, na ordem
 * recebida, que está livre durante todo o atendimento.
 */
export function buildAvailabilitySlots({
  store,
  date,
  durationMinutes,
  members,
  now = new Date(),
}: AvailabilityParams): AvailabilitySlot[] {
  // Meio-dia em UTC mantém o mesmo dia da semana em qualquer fuso do servidor
  const selectedDate = new Date(`${date}T12:00:00Z`);
  const storeNow = getStoreNow(store.timezone || 'America/Sao_Paulo', now);
  const isClosedDay =
    store.businessDays?.[WEEK_DAYS[selectedDate.getUTCDay()]] === false;

  if (
    date < storeNow.date ||
    isClosedDay ||
    !store.openTime ||
    !store.closeTime
  ) {
    return [];
  }

  const lunchStart = store.lunchStartTime
    ? timeToMinutes(store.lunchStartTime)
    : null;
  const lunchEnd = store.lunchEndTime
    ? timeToMinutes(store.lunchEndTime)
    : null;
  const closeMinutes = timeToMinutes(store.closeTime);

  return generateTimeSlots(
    store.openTime,
    store.closeTime,
    store.lunchStartTime,
    store.lunchEndTime,
  ).map((time) => {
    const start = timeToMinutes(time);
    const end = start + durationMinutes;

    const crossesLunch =
      lunchStart !== null &&
      lunchEnd !== null &&
      start < lunchEnd &&
      end > lunchStart;
    const hasPassed = date === storeNow.date && start <= storeNow.minutes;
    const fitsInDay = end <= closeMinutes && !crossesLunch && !hasPassed;

    const member = fitsInDay
      ? members.find(
          ({ blockedTimes, schedules }) =>
            filterAvailableTimeSlots(
              [time],
              selectedDate,
              blockedTimes,
              schedules,
              durationMinutes,
            ).length > 0,
        )
      : undefined;

    return { time, available: !!member, storeMemberId: member?.id ?? null };
  });
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

/**
 * Formata lista de horários para mensagem do WhatsApp
 */
export function formatTimeSlotsForMessage(slots: string[]): string {
  const header = 'Horários disponíveis:\n\n';
  const times = slots.map((slot, index) => `${index + 1}. ${slot}`).join('\n');
  const footer = '\n\nDigite o número do horário desejado.';

  return header + times + footer;
}

/**
 * Extrai o primeiro número de uma string
 * Exemplos: "1" -> 1, "número 1" -> 1, "quero o 3" -> 3
 */
export function extractNumberFromText(text: string): number | null {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

/**
 * Obtém o horário selecionado pelo índice
 */
export function getTimeSlotByIndex(
  slots: string[],
  index: number,
): string | null {
  const arrayIndex = index - 1; // Usuário digita 1-based, array é 0-based
  if (arrayIndex >= 0 && arrayIndex < slots.length) {
    return slots[arrayIndex];
  }
  return null;
}
