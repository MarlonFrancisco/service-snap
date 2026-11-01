import type { IAppointment } from '@/types/api/schedule.types';
import type { CSSProperties } from 'react';

export type TAgendaAppointmentBlockConfig = {
  appointment: IAppointment;
  isCompact: boolean;
  showInitials: boolean;
  rowSpan: number;
  style: CSSProperties;
  onClick: (appointment: IAppointment) => void;
};
