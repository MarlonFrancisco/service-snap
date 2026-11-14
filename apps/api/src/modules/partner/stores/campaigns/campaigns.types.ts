export type TCampaignChannel = 'whatsapp' | 'email';

export type TCampaignStatus = 'queued' | 'sending' | 'done';

export type TCampaignRecipientStatus = 'queued' | 'sent' | 'failed' | 'skipped';

/** Template de marketing aprovado pela Meta na conta da loja. */
export type TCampaignTemplate = {
  name: string;
  language: string;
  /** `{nome}` e `{loja}` viram o nome do cliente e o da loja. */
  bodyParams: string[];
};

export type TInactiveCustomer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  hasWhatsapp: boolean;
  hasEmail: boolean;
  lastVisit: string;
  daysAway: number;
};

/** Quem saiu da lista pelo link do e-mail: assunto do token assinado. */
export type TOptOutSubject = { storeId: string; customerId: string };
