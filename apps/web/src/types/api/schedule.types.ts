import { IService } from './service.types';
import { IStore } from './stores.types';
import { IProfessional, IUser } from './users.types';

export type TAppointmentStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface IAppointment {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  status: TAppointmentStatus;
  notes?: string;
  /** Preço e moeda gravados na reserva; nulos em agendamentos antigos. */
  price?: number | null;
  currency?: string | null;
  /** Quando o cliente respondeu "Sim" ao lembrete do WhatsApp; remarcar zera. */
  presenceConfirmedAt?: string | null;
  user: IUser;
  service: IService;
  storeMember: IProfessional;
  store: IStore;
}

/** Agendamento cujo lembrete perguntou se o cliente vem e ainda está sem resposta. */
export interface IPresenceAwaiting {
  scheduleId: string;
  reminderSentAt: string;
}

export interface IAvailabilitySlot {
  time: string;
  available: boolean;
  storeMemberId: string | null;
}

export interface ICreateAppointment {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  status: TAppointmentStatus;
  notes?: string;
  user: Partial<IUser>;
  services: Partial<IService>[];
  storeMember: Partial<IProfessional>;
  store: Partial<IStore>;
}
