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
  /** Papel de quem está logado nesta loja (vem em `GET partner/stores`). */
  memberRole?: 'owner' | 'manager' | 'professional';
  /** Link curto: `/booking/<slug>`. Lojas sem nome ainda não têm. */
  slug?: string | null;
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
  monthlyGoal?: number;
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
  // Regras de agenda (valem para o cliente e o bot; a equipe passa por cima)
  /** Passo da grade: 5, 10, 15, 20, 30, 45, 60, 90 ou 120. */
  slotIntervalMinutes?: number;
  /** Folga entre atendimentos do mesmo profissional, 0–240. */
  bufferMinutes?: number;
  /** Antecedência mínima para o cliente marcar. */
  minAdvanceMinutes?: number;
  /** Até quantos dias à frente; 0 é sem limite. */
  maxAdvanceDays?: number;
  /** Cliente cancela até N horas antes; 0 é até o início. */
  cancellationNoticeHours?: number;
  /** Cliente remarca até N horas antes; 0 é até o início. */
  rescheduleNoticeHours?: number;
  notificationsHistory: INotificationsHistory[];
  notificationsSettings: INotificationsSettings;
  reviews: IReview[];
}
