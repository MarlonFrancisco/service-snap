import { isApiHttpError } from '@/service/api';
import type { IApiKey } from '@/types/api/api-keys.types';
import type {
  IWebhookDelivery,
  IWebhookEndpoint,
  TWebhookDeliveryStatus,
  TWebhookSubscribableEvent,
} from '@/types/api/webhooks.types';
import {
  formatPanelDate,
  formatPanelMoment,
} from '../audit-logs-module/audit-logs-module.helpers';
import type {
  TApiKeyRow,
  TDeliveryStatusBadge,
  TWebhookDeliveryRow,
  TWebhookEventOption,
} from './integrations-module.types';

/** Mesmo limite da API para desligar o endpoint sozinho. */
export const WEBHOOK_MAX_CONSECUTIVE_FAILURES = 20;

export const WEBHOOK_EVENT_OPTIONS: readonly TWebhookEventOption[] = [
  {
    value: 'schedule.created',
    label: 'Criado',
    description: 'Agendamento novo, pela loja, pelo cliente ou pela API',
  },
  {
    value: 'schedule.updated',
    label: 'Alterado',
    description: 'Dia, horário, profissional, status ou observação mudou',
  },
  {
    value: 'schedule.cancelled',
    label: 'Cancelado',
    description: 'Agendamento cancelado',
  },
];

export const ALL_WEBHOOK_EVENTS: TWebhookSubscribableEvent[] =
  WEBHOOK_EVENT_OPTIONS.map((option) => option.value);

/** "Criado, alterado e cancelado". */
export const describeWebhookEvents = (events: TWebhookSubscribableEvent[]) => {
  const labels = WEBHOOK_EVENT_OPTIONS.filter((option) =>
    events.includes(option.value),
  ).map((option, index) =>
    index === 0 ? option.label : option.label.toLowerCase(),
  );

  if (labels.length <= 1) return labels[0] ?? 'Nenhum evento';

  return `${labels.slice(0, -1).join(', ')} e ${labels.at(-1)}`;
};

export const describeDisabledEndpoint = (endpoint: IWebhookEndpoint) =>
  endpoint.consecutiveFailures >= WEBHOOK_MAX_CONSECUTIVE_FAILURES
    ? `Desligado depois de ${endpoint.consecutiveFailures} falhas seguidas`
    : 'Desligado';

export const toApiKeyRow = (apiKey: IApiKey): TApiKeyRow => ({
  id: apiKey.id,
  name: apiKey.name,
  prefix: `${apiKey.prefix}…`,
  createdAt: formatPanelDate(apiKey.createdAt),
  lastUsed: apiKey.lastUsedAt
    ? formatPanelMoment(apiKey.lastUsedAt)
    : 'Nunca usada',
  isRevoked: !!apiKey.revokedAt,
});

/** Ativas primeiro; dentro de cada grupo, a ordem da API (mais nova antes). */
export const sortApiKeys = (apiKeys: IApiKey[]) => [
  ...apiKeys.filter((apiKey) => !apiKey.revokedAt),
  ...apiKeys.filter((apiKey) => !!apiKey.revokedAt),
];

const DELIVERY_STATUS: Record<TWebhookDeliveryStatus, TDeliveryStatusBadge> = {
  delivered: { label: 'Entregue', tone: 'success' },
  failed: { label: 'Falhou', tone: 'danger' },
  pending: { label: 'Na fila', tone: 'info' },
};

export const toWebhookDeliveryRow = (
  delivery: IWebhookDelivery,
): TWebhookDeliveryRow => ({
  id: delivery.id,
  event: delivery.event,
  status: DELIVERY_STATUS[delivery.status] ?? DELIVERY_STATUS.pending,
  attempts: delivery.attempts,
  httpStatus: delivery.responseStatus ? String(delivery.responseStatus) : '—',
  when: formatPanelMoment(delivery.deliveredAt ?? delivery.updatedAt),
  canRetry: delivery.status === 'failed',
  error: delivery.error,
});

const getErrorMessage = (error: unknown) =>
  isApiHttpError(error) ? error.message : '';

/** Mensagens da API (em inglês) trocadas pelo que a loja precisa fazer. */
export const getWebhookSaveError = (error: unknown) => {
  const message = getErrorMessage(error);

  if (isApiHttpError(error) && error.status === 403) {
    return 'Só o dono e o gerente da loja configuram webhooks.';
  }
  if (isApiHttpError(error) && error.status === 503) {
    return 'Webhooks estão indisponíveis no momento. Tente mais tarde.';
  }
  if (/HTTPS/i.test(message)) return 'Use um endereço com https://.';
  if (/public address/i.test(message)) {
    return 'O endereço precisa ser público na internet (não vale rede interna).';
  }
  if (isApiHttpError(error) && error.status === 400) {
    return 'Confira o endereço (com https://) e escolha ao menos um evento.';
  }

  return 'Não foi possível salvar o webhook. Tente de novo.';
};

export const getApiKeyCreateError = (error: unknown) => {
  if (isApiHttpError(error) && error.status === 403) {
    return 'Só o dono e o gerente da loja criam chaves de API.';
  }
  if (isApiHttpError(error) && error.status === 400) {
    return 'Dê um nome de 2 a 80 caracteres para a chave.';
  }

  return 'Não foi possível criar a chave. Tente de novo.';
};

/** Resultado do envio de teste para o aviso na tela. */
export const describePingResult = ({
  ok,
  status,
  error,
}: {
  ok: boolean;
  status: number | null;
  error: string | null;
}) => {
  if (ok) return `Teste entregue${status ? ` (HTTP ${status})` : ''}.`;
  if (status) return `O teste falhou: seu sistema respondeu HTTP ${status}.`;

  return `O teste falhou: ${error || 'sem resposta do endereço'}.`;
};
