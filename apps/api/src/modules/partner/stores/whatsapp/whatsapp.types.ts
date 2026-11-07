export interface IWhatsappInteractiveList {
  phoneNumberId: string;
  to: string;
  headerText: string;
  bodyText: string;
  footerText: string;
  buttonText: string;
  sections: {
    title: string;
    rows: { id: string; title: string; description?: string }[];
  }[];
  accessToken: string;
}

/** Resultado de uma conferência com a Meta. `pending` quando outra falha impede checar. */
export type TWhatsappCheckState = 'ok' | 'warning' | 'error' | 'pending';

export type TWhatsappCheckKey = 'ids' | 'token' | 'webhook' | 'displayName';

export type TWhatsappCheck = {
  key: TWhatsappCheckKey;
  state: TWhatsappCheckState;
  message: string;
  /** Código de erro da Graph API, quando a Meta recusou a chamada. */
  metaCode?: number;
};

/** Erro da Graph API já extraído do axios. */
export type TMetaError = { code?: number; message?: string };

export type TMetaDebugToken = {
  is_valid?: boolean;
  expires_at?: number;
  scopes?: string[];
};

export type TMetaPhoneNumber = {
  id?: string;
  display_phone_number?: string;
  verified_name?: string;
  quality_rating?: string;
  name_status?: string;
};
