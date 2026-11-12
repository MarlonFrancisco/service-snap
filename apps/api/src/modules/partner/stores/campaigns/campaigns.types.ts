/** Só WhatsApp por enquanto: o e-mail de campanha espera o desenho aprovado. */
export type TCampaignChannel = 'whatsapp';

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

/** Corpo que o QStash devolve para a API, um por destinatário. */
export type TCampaignMessageJob = { recipientId: string };
