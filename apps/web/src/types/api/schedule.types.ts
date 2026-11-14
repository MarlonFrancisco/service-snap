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
  /** Visita a que o serviço pertence: os serviços dela andam e cancelam juntos. */
  booking?: { id: string; source?: TBookingSource } | null;
}

export type TBookingSource = 'customer' | 'store' | 'whatsapp';

/** Filtro de `GET /schedules`. Sem nada, a lista inteira; com `page`, uma página. */
export type TScheduleListQuery = {
  /** YYYY-MM-DD, inclusivo */
  from?: string;
  to?: string;
  memberId?: string;
  page?: number;
  limit?: number;
};

/** Novo dia e início da visita; sem profissional, fica o atual. */
export type TRescheduleRequest = {
  date: string;
  startTime: string;
  storeMemberId?: string;
};

/** Código do 403 quando a política da loja barra o cliente. */
export const SCHEDULE_POLICY_CODE = 'SCHEDULE_POLICY_NOTICE';

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
  /** Cliente da loja pelo `id`, ou contato novo (nome, telefone, e-mail). */
  user: Partial<IUser>;
  services: Partial<IService>[];
  storeMember: Partial<IProfessional>;
  store: Partial<IStore>;
}
