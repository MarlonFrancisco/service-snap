export const WEBHOOK_EVENTS = [
  'schedule.created',
  'schedule.updated',
  'schedule.cancelled',
] as const;

export type TWebhookEvent = (typeof WEBHOOK_EVENTS)[number] | 'ping';

export type TWebhookDeliveryStatus = 'pending' | 'delivered' | 'failed';

/** Corpo enviado ao endpoint da loja. `id` se repete nas novas tentativas. */
export type TWebhookPayload = {
  id: string;
  type: TWebhookEvent;
  createdAt: string;
  storeId: string;
  data: Record<string, unknown>;
};

export type TWebhookAttempt = {
  ok: boolean;
  status: number | null;
  error: string | null;
};
