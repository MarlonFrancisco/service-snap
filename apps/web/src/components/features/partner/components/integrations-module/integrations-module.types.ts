import type { TWebhookSubscribableEvent } from '@/types/api/webhooks.types';
import type { TPanelChipTone } from '../audit-logs-module/audit-logs-module.types';

export type TApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
  isRevoked: boolean;
};

export type TWebhookEventOption = {
  value: TWebhookSubscribableEvent;
  label: string;
  description: string;
};

export type TDeliveryStatusBadge = {
  label: string;
  tone: TPanelChipTone;
};

export type TWebhookDeliveryRow = {
  id: string;
  event: string;
  status: TDeliveryStatusBadge;
  attempts: number;
  httpStatus: string;
  when: string;
  canRetry: boolean;
  error: string | null;
};

/** Segredo mostrado uma vez na tela, nunca salvo no navegador. */
export type TOneTimeSecret = {
  title: string;
  value: string;
};
