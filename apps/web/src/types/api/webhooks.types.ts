/** Eventos que a loja pode assinar; `ping` é só o envio de teste. */
export type TWebhookSubscribableEvent =
  | 'schedule.created'
  | 'schedule.updated'
  | 'schedule.cancelled';

export type TWebhookEvent = TWebhookSubscribableEvent | 'ping';

export type TWebhookDeliveryStatus = 'pending' | 'delivered' | 'failed';

export interface IWebhookEndpoint {
  id: string;
  url: string;
  description: string | null;
  events: TWebhookSubscribableEvent[];
  isActive: boolean;
  /** Ao chegar no limite da API, o endpoint é desligado sozinho. */
  consecutiveFailures: number;
  createdAt: string;
  updatedAt: string;
}

/** Criação devolve o segredo inteiro uma vez. */
export type TCreatedWebhookEndpoint = IWebhookEndpoint & { secret: string };

export type TWebhookSecret = { secret: string };

export interface IWebhookDelivery {
  id: string;
  event: TWebhookEvent;
  status: TWebhookDeliveryStatus;
  attempts: number;
  responseStatus: number | null;
  error: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Resultado do envio de teste, que a API espera terminar. */
export type TWebhookPingResult = {
  ok: boolean;
  status: number | null;
  error: string | null;
};

/** Reenvio entra na fila: a entrega muda de status depois. */
export type TWebhookRetryResult = { id: string; status: 'queued' };

export type TCreateWebhookEndpoint = {
  url: string;
  description?: string;
  events: TWebhookSubscribableEvent[];
};

export type TUpdateWebhookEndpoint = Partial<TCreateWebhookEndpoint> & {
  isActive?: boolean;
};
