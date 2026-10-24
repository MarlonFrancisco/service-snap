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

/** Public booking availability — no customer PII. */
export interface IScheduleAvailability {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  status: TAppointmentStatus;
  storeMember: { id: string };
}
