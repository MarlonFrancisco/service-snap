import type { TAgendaVisit } from '@/store/admin/agenda';
import type { CSSProperties, DragEvent } from 'react';

export type TAgendaAppointmentBlockConfig = {
  appointment: TAgendaVisit;
  isCompact: boolean;
  showInitials: boolean;
  rowSpan: number;
  style: CSSProperties;
  /** Pode ser arrastado para outro horário (só agendado, no desktop). */
  isDraggable: boolean;
  /** Está sendo arrastado: vira o contorno "Saindo de HH:MM". */
  isMoving: boolean;
  onClick: (appointment: TAgendaVisit) => void;
  onDragStart: (appointment: TAgendaVisit, event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
};
