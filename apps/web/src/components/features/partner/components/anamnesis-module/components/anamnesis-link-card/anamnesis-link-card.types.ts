import type { IAppointment } from '@/types/api/schedule.types';

export type TAnamnesisLinkCardConfig = {
  /** Agendamento aberto nos detalhes (o primeiro serviço da visita). */
  appointment: IAppointment;
};
