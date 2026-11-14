export type TCampaignChannel = 'whatsapp' | 'email';

export type TCampaignStatus = 'queued' | 'sending' | 'done';

export type TCampaignRecipientStatus = 'queued' | 'sent' | 'failed' | 'skipped';

/** Template de marketing aprovado pela Meta na conta da loja. */
export interface ICampaignTemplate {
  name: string;
  language: string;
  /** `{nome}` e `{loja}` viram o nome do cliente e o da loja. */
  bodyParams: string[];
}

/** Cliente que veio e não voltou, sem horário marcado. */
export interface IInactiveCustomer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  hasWhatsapp: boolean;
  hasEmail: boolean;
  /** `YYYY-MM-DD` */
  lastVisit: string;
  daysAway: number;
}

export interface ICampaign {
  id: string;
  name: string;
  channel: TCampaignChannel;
  inactiveDays: number;
  /** Só no WhatsApp. */
  template: ICampaignTemplate | null;
  /** Só no e-mail: texto escrito pela loja. */
  message: string | null;
  status: TCampaignStatus;
  recipientsCount: number;
  createdAt: string;
  /** Vêm na listagem. */
  sentCount?: number;
  failedCount?: number;
}

export interface ICampaignRecipient {
  id: string;
  status: TCampaignRecipientStatus;
  /** Em `skipped`: `opt-out` ou `no-phone`; em `failed`, a mensagem do erro. */
  error: string | null;
  sentAt: string | null;
  customer: { id: string; firstName: string | null; lastName: string | null };
}

export interface ICampaignDetail extends ICampaign {
  recipients: ICampaignRecipient[];
}

export type TCreateCampaign = {
  name: string;
  channel: TCampaignChannel;
  /** 7 a 730. */
  inactiveDays: number;
  /** Só parte da lista; sem ela, vão todos os que podem receber. */
  customerIds?: string[];
  /** Só no WhatsApp. */
  template?: ICampaignTemplate;
  /** Só no e-mail: 10 a 1000 caracteres. */
  message?: string;
};

export type TMarketingOptOutResponse = {
  customerId: string;
  optedOut: boolean;
};

/** Link "Sair da lista" do e-mail: nome da loja e se o cliente já saiu. */
export type TMarketingOptOutLink = {
  storeName: string;
  optedOut: boolean;
};
