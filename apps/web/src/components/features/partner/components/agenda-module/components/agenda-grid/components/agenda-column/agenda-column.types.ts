import type { IAppointment } from '@/types/api/schedule.types';
import type { TAgendaColumn } from '../../agenda-grid.types';

export type TAgendaColumnConfig = {
  column: TAgendaColumn;
  slotHeight: number;
  showInitials: boolean;
  onAppointmentClick: (appointment: IAppointment) => void;
};
