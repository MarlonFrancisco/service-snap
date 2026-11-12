import type { TAgendaDropTarget, TAgendaVisit } from '@/store/admin/agenda';
import type { DragEvent } from 'react';

export type TAgendaDragHandlers = {
  canDrag: (visit: TAgendaVisit) => boolean;
  /** Visita sendo arrastada ou aguardando a confirmação. */
  movingVisitId?: string;
  /** Linha marcada como destino ("Soltar aqui"). */
  activeDropKey?: string;
  isDragging: boolean;
  handleBlockDragStart: (
    visit: TAgendaVisit,
    event: DragEvent<HTMLElement>,
  ) => void;
  handleBlockDragEnd: () => void;
  handleRowDragOver: (
    target: TAgendaDropTarget,
    event: DragEvent<HTMLElement>,
  ) => void;
  handleRowDragLeave: (
    target: TAgendaDropTarget,
    event: DragEvent<HTMLElement>,
  ) => void;
  handleRowDrop: (
    target: TAgendaDropTarget,
    event: DragEvent<HTMLElement>,
  ) => void;
};
