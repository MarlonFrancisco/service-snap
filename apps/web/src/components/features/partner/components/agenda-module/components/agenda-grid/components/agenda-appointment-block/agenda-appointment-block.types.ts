import type { IAppointment } from '@/types/api/schedule.types';
import type { CSSProperties } from 'react';
import type { TAppointmentPresence } from '../../agenda-grid.types';

export type TAgendaAppointmentBlockConfig = {
  appointment: IAppointment;
  isCompact: boolean;
  showInitials: boolean;
  rowSpan: number;
  presence: TAppointmentPresence | null;
  style: CSSProperties;
  onClick: (appointment: IAppointment) => void;
};
