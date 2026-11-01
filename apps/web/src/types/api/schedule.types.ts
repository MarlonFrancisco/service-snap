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
  user: IUser;
  service: IService;
  storeMember: IProfessional;
  store: IStore;
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
