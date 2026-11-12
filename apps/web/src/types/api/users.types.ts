import { IBlockedTime } from './blocked-times.types';
import { IFavorite } from './favorites.types';
import { IAppointment } from './schedule.types';
import { IService } from './service.types';
import { IStore } from './stores.types';

export type TProfessionalRole = 'owner' | 'manager' | 'professional';

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  telephone: string;
  avatar?: string;
  favorites: IFavorite[];
  schedules: IAppointment[];
  createdAt: Date;
}

/** Expediente de um dia, HH:MM. */
export type TDayHours = {
  openTime: string;
  closeTime: string;
  lunchStartTime?: string | null;
  lunchEndTime?: string | null;
};

export type TWeekDay =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

/** Dia ausente segue a loja; `null` é folga fixa. O objeto nulo segue a loja toda. */
export type TMemberWorkingHours = Partial<Record<TWeekDay, TDayHours | null>>;

export interface IProfessional {
  id: string;
  role: TProfessionalRole;
  isActive: boolean;
  workingHours?: TMemberWorkingHours | null;
  user: IUser;
  createdAt: Date;
  store?: IStore;
  services?: IService[];
  schedules: IAppointment[];
  blockedTimes: IBlockedTime[];
}
