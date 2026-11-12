import type { Store } from '../../modules/partner/stores/store.entity';

export type TWeekDay =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

/** Expediente de um dia, em HH:MM. O almoço é opcional. */
export type TDayHours = {
  openTime: string;
  closeTime: string;
  lunchStartTime?: string | null;
  lunchEndTime?: string | null;
};

/**
 * Horário próprio de um profissional. Dia ausente segue o horário da loja;
 * dia `null` é folga fixa.
 */
export type TWorkingHours = Partial<Record<TWeekDay, TDayHours | null>>;

/** Regras de agenda da loja usadas no cálculo de horários livres. */
export type TScheduleRules = {
  /** Passo da grade de horários. */
  slotIntervalMinutes?: number | null;
  /** Folga mínima entre o fim de um atendimento e o início do próximo. */
  bufferMinutes?: number | null;
  /** Antecedência mínima para o cliente reservar. */
  minAdvanceMinutes?: number | null;
  /** Até quantos dias à frente o cliente reserva. 0 é sem limite. */
  maxAdvanceDays?: number | null;
};

/** Intervalo bloqueado na agenda; sem `endTime` é um registro antigo de um slot. */
export type TBlockedRange = {
  date: Date | string;
  time: string;
  endTime?: string | null;
  isRecurring?: boolean | null;
  dayOfWeek?: number | string | null;
};

/** Horário pedido para um profissional, na ordem em que os serviços acontecem. */
export type TSlotRequest = {
  store: Store;
  storeMemberId: string;
  date: string; // formato YYYY-MM-DD
  items: { startTime: string; endTime: string }[];
  /** Atendimento que está sendo movido: não conta como conflito consigo mesmo. */
  excludeId?: string;
  /** Exige um horário que a loja ofereceria (expediente, bloqueios, não passado). */
  enforceAvailability: boolean;
};

export type TCalendarEvent = {
  title: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  timezone: string;
  location: string;
};

/** Profissional na conta de horários livres de um dia. */
export type TAvailabilityMember = {
  id: string;
  blockedTimes: TBlockedRange[];
  schedules: {
    date: Date | string;
    startTime: string;
    endTime: string;
    status: string;
  }[];
  workingHours?: TWorkingHours | null;
};
