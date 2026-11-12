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

/** Template de mensagem criado na conta do WhatsApp Business de cada loja. */
export type TWhatsappTemplateDefinition = {
  name: string;
  language: string;
  category: 'UTILITY' | 'MARKETING';
  header: string;
  body: string;
  /** Um valor por variável do corpo, na ordem de {{1}} em diante. */
  example: readonly string[];
  /** Botões de resposta rápida, na ordem do `index` usado no envio. */
  quickReplies?: readonly string[];
};

export type TWhatsappTemplateSend = {
  name: string;
  language: string;
  bodyParams: string[];
  /** Um por botão de resposta rápida: volta no webhook quando o cliente toca. */
  buttonPayloads?: string[];
};

/** `MISSING` quando a WABA ainda não tem o template; os outros vêm da Meta. */
export type TWhatsappTemplateStatus = {
  name: string;
  status: 'MISSING' | 'APPROVED' | 'PENDING' | 'REJECTED' | (string & {});
  rejectedReason?: string;
};

/** Número que a loja divulga para o cliente falar com o bot. */
export type TWhatsappBotContact = {
  displayPhoneNumber: string;
  link: string;
};

/** Resultado de uma conferência com a Meta. `pending` quando outra falha impede checar. */
export type TWhatsappCheckState = 'ok' | 'warning' | 'error' | 'pending';

export type TWhatsappCheckKey = 'ids' | 'token' | 'webhook' | 'displayName';

export type TWhatsappCheck = {
  key: TWhatsappCheckKey;
  state: TWhatsappCheckState;
  message: string;
  /** Código de erro da Graph API, quando a Meta recusou a chamada. */
  metaCode?: number;
  /** Só na conferência `ids` com erro: números que o token alcança, com os IDs certos. */
  suggestions?: TWhatsappIdsSuggestion[];
};

export type TWhatsappIdsSuggestion = {
  phoneNumberId: string;
  businessAccountId: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
};

/** Erro da Graph API já extraído do axios. */
export type TMetaError = {
  code?: number;
  subcode?: number;
  message?: string;
};

export type TMetaDebugToken = {
  is_valid?: boolean;
  expires_at?: number;
  scopes?: string[];
  /** Para as permissões do WhatsApp, `target_ids` são as contas do WhatsApp Business liberadas. */
  granular_scopes?: { scope: string; target_ids?: string[] }[];
};

export type TMetaPhoneNumber = {
  id?: string;
  display_phone_number?: string;
  verified_name?: string;
  quality_rating?: string;
  name_status?: string;
};
