import type { IAppointment } from '@/types/api/schedule.types';
import type { IProfessional } from '@/types/api/users.types';
import type { MouseEvent } from 'react';

/**
 * Dados computados de um dia
 */
export type TDayViewData = {
  date: Date;
  dayIndex: number;
  isToday: boolean;
  isWorkingDay: boolean;
  dayKey: string;
  label: string;
};

/**
 * Dados de um professional selecionado
 */
export type TSelectedProfessionalData = {
  name: string | null;
  professional: IProfessional | null;
};

export type TPositionedAppointment = {
  appointment: IAppointment;
  rowStart: number;
  rowEnd: number;
  rowSpan: number;
  lane: number;
  laneCount: number;
  clusterStart: number;
  clusterEnd: number;
};

export type TAgendaSlotState =
  | 'free'
  | 'blocked'
  | 'selected-to-block'
  | 'selected-to-unblock';

export type TAgendaSlotHandlers = {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: () => void;
  onMouseUp?: () => void;
};

export type TAgendaSlot = {
  state: TAgendaSlotState;
  text: string;
  ariaLabel: string;
  isInteractive: boolean;
  isPressed?: boolean;
  isGutter?: boolean;
  handlers: TAgendaSlotHandlers;
};

export type TAgendaColumnRow = {
  time: string;
  slot: TAgendaSlot | null;
};

/**
 * Resposta ao lembrete do WhatsApp. Só existe para agendamentos com status
 * `scheduled`: confirmado vence aguardando quando os dois aparecem.
 */
export type TAppointmentPresence =
  | { kind: 'confirmed'; confirmedAt: string }
  | { kind: 'awaiting'; reminderSentAt: string };

export type TAppointmentPresenceKind = TAppointmentPresence['kind'];

export type TAgendaColumnBlock = TPositionedAppointment & {
  hasGutter: boolean;
  isCompact: boolean;
  presence: TAppointmentPresence | null;
};

export type TAgendaColumn = {
  rows: TAgendaColumnRow[];
  blocks: TAgendaColumnBlock[];
};
