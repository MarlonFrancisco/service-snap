import type { HTMLAttributes } from 'react';
import type { TAppointmentPresenceKind } from '../../agenda-grid.types';

export type TAgendaPresenceChipConfig = HTMLAttributes<HTMLSpanElement> & {
  kind: TAppointmentPresenceKind;
  /** Borda para quando o selo fica sobre fundo branco (legenda, cartão mobile). */
  isBordered?: boolean;
};
