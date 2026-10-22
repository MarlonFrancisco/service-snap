import { TCountryCode, TCurrencyCode } from '@repo/shared/constants';
import { IReview } from '../reviews.types';
import {
  INotificationsHistory,
  INotificationsSettings,
} from './notifications.types';
import { IAppointment } from './schedule.types';
import { IService } from './service.types';
import { IProfessional } from './users.types';

export interface IStoreGallery {
  id: string;
  url: string;
  isMain: boolean;
  store?: IStore;
}

export interface TWorkingHours {
  openTime: string;
  closeTime: string;
  lunchStartTime: string;
  lunchEndTime: string;
}

export interface TWorkingDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface IStore extends TWorkingHours {
  id: string;
  name: string;
  description: string;
  country: TCountryCode;
  currency: TCurrencyCode;
  timezone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  telephone: string;
  isActive: boolean;
  amenities: string[];
  openTime: string;
  closeTime: string;
  lunchStartTime: string;
  lunchEndTime: string;
  gallery: IStoreGallery[];
  /** Ausente na listagem slim (`GET /partner/stores`); presente no detalhe / agenda. */
  storeMembers?: IProfessional[];
  services: IService[];
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  schedules: IAppointment[];
  businessDays: TWorkingDays;
  notificationsHistory: INotificationsHistory[];
  notificationsSettings: INotificationsSettings;
  reviews: IReview[];
}
