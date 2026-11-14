import { IProfessional } from './users.types';

export interface IBlockedTime {
  id: string;
  date: string;
  /** Início, HH:MM. */
  time: string;
  /** Fim, HH:MM ("24:00" fecha o dia). Nulo em bloqueios antigos de um slot. */
  endTime?: string | null;
  isRecurring?: boolean;
  dayOfWeek: number;
  storeMember: IProfessional;
}
