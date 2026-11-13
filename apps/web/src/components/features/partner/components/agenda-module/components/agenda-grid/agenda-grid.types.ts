import type { TAgendaDropTarget, TAgendaVisit } from '@/store/admin/agenda';
import type { IBlockedTime } from '@/types/api/blocked-times.types';
import type { IStoreHoliday } from '@/types/api/holidays.types';
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
  /** Feriado da loja: ninguém atende. */
  holiday?: IStoreHoliday;
  /** Todos os profissionais mostrados estão de folga neste dia. */
  isOff: boolean;
  /** Rótulo pequeno do cabeçalho: "Feriado" ou "Folga". */
  headerNote?: string;
};

/** Aviso que ocupa a coluna: feriado (loja fechada) ou folga do profissional. */
export type TAgendaClosedNotice = {
  variant: 'holiday' | 'off';
  title: string;
  text: string;
};

/**
 * Dados de um professional selecionado
 */
export type TSelectedProfessionalData = {
  name: string | null;
  professional: IProfessional | null;
};

export type TPositionedAppointment = {
  appointment: TAgendaVisit;
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
  /** Presente quando dá para soltar um agendamento arrastado aqui. */
  dropTarget?: TAgendaDropTarget;
  handlers: TAgendaSlotHandlers;
};

export type TAgendaColumnRow = {
  time: string;
  slot: TAgendaSlot | null;
};

export type TAgendaColumnBlock = TPositionedAppointment & {
  hasGutter: boolean;
  isCompact: boolean;
};

/** Bloqueio de mais de um slot, desenhado como um bloco "Bloqueado · 14:00–15:30". */
export type TAgendaBlockedBlock = {
  blockedTime: IBlockedTime;
  rowStart: number;
  rowSpan: number;
  label: string;
};

export type TAgendaColumn = {
  rows: TAgendaColumnRow[];
  blocks: TAgendaColumnBlock[];
  blockedBlocks: TAgendaBlockedBlock[];
  closedNotice?: TAgendaClosedNotice;
};
