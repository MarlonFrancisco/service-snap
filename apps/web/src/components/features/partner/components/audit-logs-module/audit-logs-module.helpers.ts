import type { IAuditLog, TAuditActorType } from '@/types/api/audit-logs.types';
import type {
  TAuditActionDescriptor,
  TAuditActorBadge,
  TAuditAreaOption,
  TAuditLogRow,
} from './audit-logs-module.types';

export const AUDIT_PAGE_SIZE = 20;

/** Valor do Select para "sem filtro" (o Radix não aceita valor vazio). */
export const AUDIT_ALL_OPTION = 'all';

const DAY_MS = 86_400_000;

const pad = (value: number) => String(value).padStart(2, '0');

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** `dd/mm/aaaa` no fuso de quem está vendo. */
export const formatPanelDate = (iso: string | null | undefined) => {
  if (!iso) return '';

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return '';

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

/** "Hoje, 10:42", "Ontem, 18:30" ou "05/11/2026, 09:02". */
export const formatPanelMoment = (
  iso: string | null | undefined,
  { withSeconds = false, now = new Date() } = {},
) => {
  if (!iso) return '';

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return '';

  const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}${
    withSeconds ? `:${pad(date.getSeconds())}` : ''
  }`;
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (daysAgo === 0) return `Hoje, ${clock}`;
  if (daysAgo === 1) return `Ontem, ${clock}`;

  return `${formatPanelDate(iso)}, ${clock}`;
};

/** Áreas do filtro: o valor é o recurso que a API grava (`resourceType`). */
export const AUDIT_AREA_OPTIONS: readonly TAuditAreaOption[] = [
  { value: AUDIT_ALL_OPTION, label: 'Todas' },
  { value: 'schedules', label: 'Agendamentos' },
  { value: 'customers', label: 'Clientes' },
  { value: 'checkouts', label: 'Fechamento' },
  { value: 'cash-sessions', label: 'Caixa' },
  { value: 'payments', label: 'Pagamentos' },
  { value: 'rules', label: 'Comissões' },
  { value: 'packages', label: 'Pacotes' },
  { value: 'anamnesis-responses', label: 'Anamnese' },
  { value: 'campaigns', label: 'Campanhas' },
  { value: 'members', label: 'Equipe' },
  { value: 'services', label: 'Serviços' },
  { value: 'api-keys', label: 'Chaves de API' },
  { value: 'webhooks', label: 'Webhooks' },
];

/** Nome da área a partir do último trecho fixo da rota. */
const AREA_BY_RESOURCE: Record<string, string> = {
  schedules: 'Agendamento',
  reschedule: 'Agendamento',
  'schedule-series': 'Agendamento',
  'anamnesis-link': 'Anamnese',
  'anamnesis-forms': 'Anamnese',
  'anamnesis-responses': 'Anamnese',
  customers: 'Clientes',
  'marketing-opt-out': 'Clientes',
  checkouts: 'Fechamento',
  'cash-sessions': 'Caixa',
  close: 'Caixa',
  payments: 'Pagamentos',
  void: 'Pagamentos',
  rules: 'Comissões',
  packages: 'Pacotes',
  sell: 'Pacotes',
  'customer-packages': 'Pacotes',
  'loyalty-program': 'Fidelidade',
  redeem: 'Fidelidade',
  campaigns: 'Campanhas',
  members: 'Equipe',
  'blocked-times': 'Equipe',
  bulk: 'Equipe',
  services: 'Serviços',
  categories: 'Serviços',
  holidays: 'Feriados',
  reviews: 'Avaliações',
  reply: 'Avaliações',
  gallery: 'Galeria',
  'api-keys': 'Chaves de API',
  webhooks: 'Webhooks',
  rotate: 'Webhooks',
  test: 'Webhooks',
  retry: 'Webhooks',
  whatsapp: 'WhatsApp',
  'reminder-template': 'WhatsApp',
  settings: 'Notificações',
  history: 'Notificações',
  'mark-all-as-read': 'Notificações',
  stores: 'Loja',
  users: 'Conta',
};

/** Ações conhecidas, pela chave `MÉTODO rota` que o interceptor grava. */
const KNOWN_ACTIONS: Record<string, TAuditActionDescriptor> = {
  'webhook.secret.revealed': {
    label: 'Mostrou o segredo de um webhook',
    area: 'Webhooks',
  },
  'anamnesis.response.viewed': {
    label: 'Abriu uma ficha de anamnese',
    area: 'Anamnese',
  },
  'privacy.data.exported': { label: 'Baixou os próprios dados', area: 'Conta' },
  'privacy.account.deleted': {
    label: 'Excluiu a própria conta',
    area: 'Conta',
  },
  'POST /partner/stores/:storeId/schedules': {
    label: 'Criou um agendamento',
    area: 'Agendamento',
  },
  'PUT /partner/stores/:storeId/schedules/:id': {
    label: 'Alterou um agendamento',
    area: 'Agendamento',
  },
  'PATCH /partner/stores/:storeId/schedules/:id/reschedule': {
    label: 'Remarcou um agendamento',
    area: 'Agendamento',
  },
  'DELETE /partner/stores/:storeId/schedules/:id': {
    label: 'Cancelou um agendamento',
    area: 'Agendamento',
  },
  'POST /partner/stores/:storeId/schedule-series': {
    label: 'Criou agendamentos recorrentes',
    area: 'Agendamento',
  },
  'POST /partner/stores/:storeId/schedule-series/:id/cancel': {
    label: 'Cancelou agendamentos recorrentes',
    area: 'Agendamento',
  },
  'POST /v1/schedules': { label: 'Criou um agendamento', area: 'Agendamento' },
  'POST /v1/schedules/:id/cancel': {
    label: 'Cancelou um agendamento',
    area: 'Agendamento',
  },
  'POST /partner/stores/:storeId/checkouts': {
    label: 'Fechou um atendimento',
    area: 'Fechamento',
  },
  'DELETE /partner/stores/:storeId/checkouts/:id': {
    label: 'Desfez um fechamento',
    area: 'Fechamento',
  },
  'POST /partner/stores/:storeId/cash-sessions': {
    label: 'Abriu o caixa',
    area: 'Caixa',
  },
  'POST /partner/stores/:storeId/cash-sessions/:id/close': {
    label: 'Fechou o caixa',
    area: 'Caixa',
  },
  'POST /partner/stores/:storeId/payments': {
    label: 'Registrou um pagamento',
    area: 'Pagamentos',
  },
  'POST /partner/stores/:storeId/payments/:id/void': {
    label: 'Estornou um pagamento',
    area: 'Pagamentos',
  },
  'POST /partner/stores/:storeId/commissions/rules': {
    label: 'Criou uma regra de comissão',
    area: 'Comissões',
  },
  'DELETE /partner/stores/:storeId/commissions/rules/:id': {
    label: 'Removeu uma regra de comissão',
    area: 'Comissões',
  },
  'POST /partner/stores/:storeId/packages': {
    label: 'Criou um pacote',
    area: 'Pacotes',
  },
  'PATCH /partner/stores/:storeId/packages/:id': {
    label: 'Alterou um pacote',
    area: 'Pacotes',
  },
  'POST /partner/stores/:storeId/packages/:id/sell': {
    label: 'Vendeu um pacote',
    area: 'Pacotes',
  },
  'POST /partner/stores/:storeId/customer-packages/:id/cancel': {
    label: 'Cancelou o pacote de um cliente',
    area: 'Pacotes',
  },
  'PUT /partner/stores/:storeId/loyalty-program': {
    label: 'Alterou o programa de fidelidade',
    area: 'Fidelidade',
  },
  'POST /partner/stores/:storeId/loyalty-rewards/:id/redeem': {
    label: 'Resgatou uma recompensa de fidelidade',
    area: 'Fidelidade',
  },
  'POST /partner/stores/:storeId/campaigns': {
    label: 'Enviou uma campanha',
    area: 'Campanhas',
  },
  'POST /partner/stores/:storeId/anamnesis-forms': {
    label: 'Criou uma ficha de anamnese',
    area: 'Anamnese',
  },
  'PATCH /partner/stores/:storeId/anamnesis-forms/:id': {
    label: 'Alterou uma ficha de anamnese',
    area: 'Anamnese',
  },
  'DELETE /partner/stores/:storeId/anamnesis-responses/:id': {
    label: 'Apagou uma resposta de anamnese',
    area: 'Anamnese',
  },
  'POST /partner/stores/:storeId/schedules/:scheduleId/anamnesis-link': {
    label: 'Gerou um link de anamnese',
    area: 'Anamnese',
  },
  'POST /partner/stores/:storeId/customers': {
    label: 'Cadastrou um cliente',
    area: 'Clientes',
  },
  'PATCH /partner/stores/:storeId/customers/:userId': {
    label: 'Alterou a ficha de um cliente',
    area: 'Clientes',
  },
  'POST /partner/stores/:storeId/members': {
    label: 'Adicionou alguém à equipe',
    area: 'Equipe',
  },
  'PUT /partner/stores/:storeId/members/:id': {
    label: 'Alterou alguém da equipe',
    area: 'Equipe',
  },
  'DELETE /partner/stores/:storeId/members/:id': {
    label: 'Removeu alguém da equipe',
    area: 'Equipe',
  },
  'POST /partner/stores/:storeId/api-keys': {
    label: 'Criou uma chave de API',
    area: 'Chaves de API',
  },
  'DELETE /partner/stores/:storeId/api-keys/:id': {
    label: 'Revogou uma chave de API',
    area: 'Chaves de API',
  },
  'POST /partner/stores/:storeId/webhooks': {
    label: 'Criou um webhook',
    area: 'Webhooks',
  },
  'PATCH /partner/stores/:storeId/webhooks/:id': {
    label: 'Alterou um webhook',
    area: 'Webhooks',
  },
  'DELETE /partner/stores/:storeId/webhooks/:id': {
    label: 'Excluiu um webhook',
    area: 'Webhooks',
  },
  'POST /partner/stores/:storeId/webhooks/:id/secret/rotate': {
    label: 'Trocou o segredo de um webhook',
    area: 'Webhooks',
  },
  'POST /partner/stores/:storeId/webhooks/:id/test': {
    label: 'Enviou um teste de webhook',
    area: 'Webhooks',
  },
  'POST /partner/stores/:storeId/webhooks/:id/deliveries/:deliveryId/retry': {
    label: 'Reenviou uma entrega de webhook',
    area: 'Webhooks',
  },
  'PUT /partner/stores/:id': {
    label: 'Alterou os dados da loja',
    area: 'Loja',
  },
  'DELETE /partner/stores/:id': { label: 'Excluiu a loja', area: 'Loja' },
};

const VERB_BY_METHOD: Record<string, string> = {
  POST: 'Criou',
  PUT: 'Alterou',
  PATCH: 'Alterou',
  DELETE: 'Removeu',
};

const getRequestBody = (log: Pick<IAuditLog, 'metadata'>) => {
  const body = log.metadata?.body;

  return body && typeof body === 'object' && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : null;
};

/** Frase e área de uma ação; rota desconhecida vira "Alterou ... em Área". */
export const describeAuditAction = (
  log: Pick<IAuditLog, 'action' | 'resourceType' | 'metadata'>,
): TAuditActionDescriptor => {
  // O painel da plataforma usa a mesma rota para suspender e reativar
  if (log.action === 'PATCH /admin/stores/:id') {
    return {
      label:
        getRequestBody(log)?.isActive === true
          ? 'Reativou a loja'
          : 'Suspendeu a loja',
      area: 'Loja',
    };
  }

  const known = KNOWN_ACTIONS[log.action];

  if (known) return known;

  const area =
    (log.resourceType && AREA_BY_RESOURCE[log.resourceType]) || 'Outros';
  const verb = VERB_BY_METHOD[log.action.split(' ')[0] ?? ''];

  return {
    label: verb ? `${verb} dados em ${area}` : log.action,
    area,
  };
};

const ACTOR_BADGES: Record<TAuditActorType, TAuditActorBadge> = {
  user: { label: 'Equipe', tone: 'neutral' },
  api_key: { label: 'Integração', tone: 'info' },
  admin: { label: 'Plataforma', tone: 'warning' },
  system: { label: 'Sistema', tone: 'neutral' },
};

export const getAuditActorBadge = (actorType: TAuditActorType) =>
  ACTOR_BADGES[actorType] ?? ACTOR_BADGES.system;

/** Nome de quem fez; integração mostra o nome da chave quando a tela o tem. */
export const getAuditActorName = (
  log: Pick<IAuditLog, 'actorType' | 'actorName' | 'apiKeyId'>,
  apiKeyNames?: ReadonlyMap<string, string>,
) => {
  if (log.actorType === 'admin') return 'Equipe ServiceSnap';
  if (log.actorType === 'api_key') {
    return (log.apiKeyId && apiKeyNames?.get(log.apiKeyId)) || 'Chave de API';
  }
  if (log.actorType === 'system') return 'ServiceSnap';

  return log.actorName || 'Pessoa removida';
};

/** Nome de quem é da equipe; sem nome cadastrado, o e-mail. */
export const getMemberLabel = (user: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}) =>
  [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
  user.email ||
  'Sem nome';

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, 'Edge'],
  [/OPR\//, 'Opera'],
  [/Firefox\//, 'Firefox'],
  [/Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

/** "Chrome · 200.10.1.2"; sem navegador conhecido, só o programa ou o IP. */
export const describeAuditOrigin = (
  log: Pick<IAuditLog, 'userAgent' | 'ip' | 'actorType'>,
) => {
  const userAgent = log.userAgent ?? '';
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const client =
    browser ??
    (log.actorType === 'api_key'
      ? 'Integração'
      : userAgent.split(/[\s/]/)[0] || null);

  return [client, log.ip].filter(Boolean).join(' · ') || 'Não registrada';
};

const formatPayloadValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'sim' : 'não';
  if (typeof value === 'object') return JSON.stringify(value);

  return String(value);
};

/** Corpo enviado, uma linha por campo. A API já tira segredos e arquivos. */
export const formatAuditPayload = (log: Pick<IAuditLog, 'metadata'>) => {
  const body = getRequestBody(log);
  const entries = body ? Object.entries(body) : [];

  if (!entries.length) return null;

  return entries
    .map(([key, value]) => `${key}: ${formatPayloadValue(value)}`)
    .join('\n');
};

export const toAuditLogRow = (
  log: IAuditLog,
  apiKeyNames?: ReadonlyMap<string, string>,
): TAuditLogRow => {
  const { label, area } = describeAuditAction(log);
  const isFailure = (log.statusCode ?? 0) >= 400;

  return {
    id: log.id,
    when: formatPanelMoment(log.createdAt),
    whenFull: formatPanelMoment(log.createdAt, { withSeconds: true }),
    actorName: getAuditActorName(log, apiKeyNames),
    actorBadge: getAuditActorBadge(log.actorType),
    action: isFailure ? `${label} (não concluída)` : label,
    area,
    origin: describeAuditOrigin(log),
    payload: formatAuditPayload(log),
    isFailure,
  };
};
