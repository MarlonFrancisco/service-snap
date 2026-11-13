import type { IBlockedTime } from '@/types/api/blocked-times.types';
import type { IAppointment } from '@/types/api/schedule.types';
import type { IService } from '@/types/api/service.types';
import type { TWorkingDays } from '@/types/api/stores.types';
import type { IProfessional } from '@/types/api/users.types';

export type TSelectedProfessionalId = 'all' | string;

export type TWorkingDayKey = keyof TWorkingDays;

export type TAgendaViewMode = 'day' | 'week' | 'month';

/**
 * Visita na grade: os serviços de uma mesma reserva viram um bloco só, do
 * início do primeiro ao fim do último. Sem `visitItems`, é um serviço avulso.
 */
export type TAgendaVisit = IAppointment & {
  visitItems?: IAppointment[];
};

/** Retângulo da célula de destino, para ancorar o popover de confirmação. */
export type TAgendaAnchorRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/** Destino de um arrasto: dia, início e (opcional) outro profissional. */
export type TAgendaDropTarget = {
  key: string;
  date: string;
  time: string;
  /** Presente só quando a coluna é de outro profissional. */
  storeMemberId?: string;
  professionalName?: string;
};

export type TPendingReschedule = TAgendaDropTarget & {
  visit: TAgendaVisit;
  anchor: TAgendaAnchorRect;
};

export interface IAgendaState {
  currentWeek: number;
  /** Deslocamento em meses a partir do mês atual (visão Mês). */
  currentMonth: number;
  selectedProfessional: TSelectedProfessionalId;
  selectedAppointment?: IAppointment;
  detailsAppointment: TAgendaVisit;
  isAddAppointmentOpen: boolean;
  isFocusMode: boolean;
  isBlockMode: boolean;
  isBlockDialogOpen: boolean;
  isHoursPanelOpen: boolean;
  rescheduleVisit?: TAgendaVisit;
  selectedBlockedTime?: IBlockedTime;
  draggedVisit?: TAgendaVisit;
  dropTargetKey?: string;
  pendingReschedule?: TPendingReschedule;
  selectedDayIndex: number;
  viewMode: TAgendaViewMode;
  appointments: IAppointment[];
  professionals: IProfessional[];
  services: IService[];
  days: string[];
  workingDayKeys: readonly TWorkingDayKey[];
}

export interface IAgendaActions {
  setCurrentWeek: (currentWeek: number) => void;
  setCurrentMonth: (currentMonth: number) => void;
  setSelectedProfessional: (professionalId: TSelectedProfessionalId) => void;
  setIsAddAppointmentOpen: ({
    isAddAppointmentOpen,
    selectedAppointment,
  }: {
    isAddAppointmentOpen: boolean;
    selectedAppointment?: IAppointment;
  }) => void;
  setDetailsAppointment: (detailsAppointment?: TAgendaVisit) => void;
  setIsFocusMode: (isFocusMode: boolean) => void;
  setIsBlockMode: (isBlockMode: boolean) => void;
  setIsBlockDialogOpen: (isBlockDialogOpen: boolean) => void;
  setIsHoursPanelOpen: (isHoursPanelOpen: boolean) => void;
  setRescheduleVisit: (visit?: TAgendaVisit) => void;
  setSelectedBlockedTime: (blockedTime?: IBlockedTime) => void;
  setDraggedVisit: (visit?: TAgendaVisit) => void;
  setDropTargetKey: (key?: string) => void;
  setPendingReschedule: (pending?: TPendingReschedule) => void;
  setSelectedDayIndex: (index: number) => void;
  setViewMode: (viewMode: TAgendaViewMode) => void;
  /** Abre a visão Dia na data pedida (vinda da visão Mês). */
  openDay: (date: Date) => void;
}

export type IAgendaStore = IAgendaState & IAgendaActions;
