import type { TAgendaVisit } from '@/store/admin/agenda';
import type { IBlockedTime } from '@/types/api/blocked-times.types';
import type { TAgendaDragHandlers } from '../../agenda-grid-drag.types';
import type { TAgendaColumn } from '../../agenda-grid.types';

export type TAgendaColumnConfig = {
  column: TAgendaColumn;
  slotHeight: number;
  showInitials: boolean;
  drag: TAgendaDragHandlers;
  onAppointmentClick: (appointment: TAgendaVisit) => void;
  onBlockedClick: (blockedTime: IBlockedTime) => void;
};
