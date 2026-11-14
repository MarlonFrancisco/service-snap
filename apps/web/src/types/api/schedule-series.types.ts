import type { TAppointmentStatus } from './schedule.types';

/** Toda semana (1) ou a cada 2, 3 ou 4 semanas. */
export type TSeriesIntervalWeeks = 1 | 2 | 3 | 4;

/** Cliente da série: o da loja pelo `id` ou um contato novo. */
export type TScheduleSeriesCustomer = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  telephone?: string;
};

/** `POST /partner/stores/:storeId/schedule-series`. */
export type TCreateScheduleSeries = {
  /** Primeira data, `YYYY-MM-DD`. */
  date: string;
  /** `HH:MM` */
  startTime: string;
  serviceIds: string[];
  storeMemberId: string;
  customer: TScheduleSeriesCustomer;
  intervalWeeks: TSeriesIntervalWeeks;
  /** De 2 a 12, em até 6 meses. */
  occurrences: number;
  notes?: string;
};

/** Data que não entrou na série e o motivo (mensagem da API). */
export type TScheduleSeriesConflict = {
  occurrence: number;
  date: string;
  reason: string;
};

export type TScheduleSeriesCreated = {
  id: string;
  created: { occurrence: number; date: string; scheduleIds: string[] }[];
  conflicts: TScheduleSeriesConflict[];
};

/** Corpo do 400 quando nenhuma data da série está livre. */
export type TScheduleSeriesNoDateError = {
  message: string;
  conflicts?: TScheduleSeriesConflict[];
};

export type TScheduleSeriesItem = {
  occurrence: number;
  scheduleId: string;
  date: string;
  startTime: string;
  status: TAppointmentStatus;
  serviceName: string | null;
};

/** `GET /partner/stores/:storeId/schedule-series/:id`. */
export interface IScheduleSeries {
  id: string;
  intervalWeeks: TSeriesIntervalWeeks;
  occurrences: number;
  startDate: string;
  startTime: string;
  cancelledAt: string | null;
  storeMember: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  items: TScheduleSeriesItem[];
}

/** "Esta e as próximas": cancela a partir de `from` (`YYYY-MM-DD`). */
export type TCancelScheduleSeries = {
  from?: string;
};

export type TScheduleSeriesCancelled = {
  id: string;
  cancelled: string[];
};

/** De qual série um agendamento faz parte; `series: null` se é avulso. */
export type TScheduleSeriesMembership = {
  series: {
    id: string;
    occurrence: number;
    occurrences: number;
    intervalWeeks: TSeriesIntervalWeeks;
    cancelledAt: string | null;
  } | null;
};
