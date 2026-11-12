import type { TAgendaVisit } from '@/store/admin/agenda';
import type { TRescheduleRequest } from '@/types/api/schedule.types';
import type { IProfessional } from '@/types/api/users.types';

export type TRescheduleVariables = {
  visit: TAgendaVisit;
  request: TRescheduleRequest;
  /** Profissional de destino, para a grade já mostrar o bloco na coluna dele. */
  professional?: IProfessional;
};
