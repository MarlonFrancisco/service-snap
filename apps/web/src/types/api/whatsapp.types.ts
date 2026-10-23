import { IStore } from './stores.types';

export interface IWhatsappConfigPayload {
  id?: string;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
  isActive: boolean;
  store: Pick<IStore, 'id'>;
}

export interface IWhatsappConfigResponse {
  id: string;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
  isActive: boolean;
  store: Pick<IStore, 'id'>;
}

export type TWhatsappConnectionStatus =
  | 'connected'
  | 'inactive'
  | 'incomplete'
  | 'error';

export interface IWhatsappStatusResponse {
  status: TWhatsappConnectionStatus;
  isActive: boolean;
  hasCredentials: boolean;
  displayPhoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
  message?: string;
}

export interface IWhatsappTemplateSummary {
  name: string;
  status: string;
  language: string;
  category?: string;
}

export interface IWhatsappTestPayload {
  to: string;
}

export interface IWhatsappTestResponse {
  ok: boolean;
  to: string;
  message: string;
}
