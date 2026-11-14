export type TWaitlistStatus = 'waiting' | 'notified' | 'cancelled';

/** Por onde sai o aviso de vaga: quem entra pelo site recebe por e-mail. */
export type TWaitlistChannel = 'whatsapp' | 'email';

export interface IWaitlistEntry {
  id: string;
  /** Dia `YYYY-MM-DD` da fila. */
  date: string;
  status: TWaitlistStatus;
  channel: TWaitlistChannel;
  service: { id: string; name: string; duration: number };
  /** Nulo quando a fila vale para qualquer profissional. */
  storeMember: { id: string; name: string } | null;
  /** Vem só na listagem de todas as lojas (`/users/me/waitlist`). */
  store?: { id: string; name: string };
}

export interface IJoinWaitlistPayload {
  serviceId: string;
  storeMemberId?: string;
  date: string;
}
