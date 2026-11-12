import type { IAppointment } from '@/types/api/schedule.types';

/**
 * Uma visita: os serviços marcados juntos. A API cancela e remarca a visita
 * inteira a partir de qualquer um deles; usamos o primeiro.
 */
export type TProfileVisit = {
  id: string;
  appointment: IAppointment;
  appointments: IAppointment[];
  serviceNames: string;
  serviceIds: string[];
  startTime: string;
  endTime: string;
};

export type TPolicyBlock = {
  title: string;
  message: string;
  hint: string;
  whatsAppUrl: string | null;
};
