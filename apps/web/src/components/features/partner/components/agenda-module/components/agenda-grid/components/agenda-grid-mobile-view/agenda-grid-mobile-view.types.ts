import type { IAppointment } from '@/types/api/schedule.types';
import type { TAgendaSlot } from '../../agenda-grid.types';
import type { useAgendaGrid } from '../../agenda-grid.hook';

/**
 * Configuração para Mobile View
 */
export type TMobileViewConfig = {
  gridHook: ReturnType<typeof useAgendaGrid>;
};

export type TMobileBlockItem =
  | { key: string; appointment: IAppointment; slot?: undefined }
  | { key: string; appointment?: undefined; slot: TAgendaSlot };
