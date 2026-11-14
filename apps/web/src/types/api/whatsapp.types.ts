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

/** `pending` quando outra falha impede a conferência (ex.: token recusado). */
export type TWhatsappCheckState = 'ok' | 'warning' | 'error' | 'pending';

export type TWhatsappCheckKey = 'ids' | 'token' | 'webhook' | 'displayName';

export interface IWhatsappCheck {
  key: TWhatsappCheckKey;
  state: TWhatsappCheckState;
  message: string;
  metaCode?: number;
  /** Só na conferência `ids` com erro: números que o token alcança, com os IDs certos. */
  suggestions?: IWhatsappIdsSuggestion[];
}

export interface IWhatsappIdsSuggestion {
  phoneNumberId: string;
  businessAccountId: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
}

export interface IWhatsappStatusResponse {
  status: TWhatsappConnectionStatus;
  isActive: boolean;
  hasCredentials: boolean;
  displayPhoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
  message?: string;
  /** Uma conferência por credencial; só vem quando as três estão preenchidas. */
  checks?: IWhatsappCheck[];
  /** Link `wa.me` do bot da loja; só vem com `status === 'connected'`. */
  botLink?: string;
}

export interface IWhatsappTemplateSummary {
  name: string;
  status: string;
  language: string;
  category?: string;
}

/** `MISSING` quando a WABA ainda não tem o template; os outros vêm da Meta. */
export type TWhatsappReminderTemplateStatus =
  | 'MISSING'
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED'
  | (string & {});

export interface IWhatsappReminderTemplate {
  name: string;
  status: TWhatsappReminderTemplateStatus;
  rejectedReason?: string;
}

export interface IWhatsappTestPayload {
  to: string;
}

export interface IWhatsappTestResponse {
  ok: boolean;
  to: string;
  message: string;
}
