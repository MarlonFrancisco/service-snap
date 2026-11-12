import type { TAuditEntry, TAuditedRequest } from './audit.types';

const AUDITED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const AUDITED_PREFIXES = ['/partner', '/v1', '/admin'];

// Nada que dê acesso a conta ou integração, nem dado de saúde, vai para o log
const SECRET_KEY = /token|secret|password|authcode|code$|answers|signature/i;
// Base64 de imagem e textos longos só incham a tabela
const BULKY_KEY = /avatar|image|file|base64|photo/i;
const MAX_STRING = 300;
const MAX_DEPTH = 3;
const MAX_ARRAY = 20;
const MAX_METADATA_CHARS = 4000;

export const shouldAudit = (request: TAuditedRequest): boolean => {
  const path = request.route?.path ?? '';

  return (
    AUDITED_METHODS.has(request.method) &&
    AUDITED_PREFIXES.some((prefix) => path.startsWith(prefix))
  );
};

/** Cópia do corpo sem segredos e com tamanho limitado. */
export const sanitizeForAudit = (value: unknown, depth = 0): unknown => {
  if (value == null || typeof value === 'number' || typeof value === 'boolean')
    return value;

  if (typeof value === 'string') {
    return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  }

  if (depth >= MAX_DEPTH) return '[…]';

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY)
      .map((item) => sanitizeForAudit(item, depth + 1));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => {
        if (SECRET_KEY.test(key)) return [key, '[omitido]'];
        if (BULKY_KEY.test(key)) return [key, '[arquivo]'];
        return [key, sanitizeForAudit(item, depth + 1)];
      }),
    );
  }

  return String(value);
};

const limitMetadata = (metadata: Record<string, unknown>) =>
  JSON.stringify(metadata).length > MAX_METADATA_CHARS
    ? { truncated: true, keys: Object.keys(metadata) }
    : metadata;

/**
 * `/partner/stores/:storeId/schedules/:id` → loja, recurso `schedules` e o id.
 * Rotas da própria loja (`/partner/stores/:id`) usam `id` como loja.
 */
export const resolveAuditTarget = (
  request: TAuditedRequest,
  responseBody: unknown,
): Pick<TAuditEntry, 'storeId' | 'resourceType' | 'resourceId'> => {
  const path = request.route?.path ?? '';
  const params = request.params ?? {};
  const segments = path.split('/').filter(Boolean);
  const isStoreRoot = path.startsWith('/partner/stores/:id');
  const storeId =
    params.storeId ??
    (isStoreRoot ? params.id : undefined) ??
    request.apiKey?.storeId ??
    null;

  // Último trecho fixo da rota: `schedules`, `payments`, `reply`...
  const resourceType =
    [...segments].reverse().find((segment) => !segment.startsWith(':')) ?? null;
  const createdId =
    responseBody && typeof responseBody === 'object' && 'id' in responseBody
      ? String((responseBody as { id: unknown }).id)
      : null;
  const resourceId = params.id ?? createdId;

  return { storeId, resourceType, resourceId: resourceId?.slice(0, 64) };
};

export const buildRequestAuditEntry = (
  request: TAuditedRequest,
  statusCode: number,
  responseBody: unknown,
): TAuditEntry => {
  const userAgent = request.headers['user-agent'];

  return {
    ...resolveAuditTarget(request, responseBody),
    actorType: request.apiKey
      ? 'api_key'
      : request.isPlatformAdmin
        ? 'admin'
        : 'user',
    actorUserId: request.user?.sub ?? null,
    apiKeyId: request.apiKey?.id ?? null,
    action: `${request.method} ${request.route?.path}`.slice(0, 160),
    statusCode,
    metadata: limitMetadata({
      params: request.params,
      body: sanitizeForAudit(request.body),
    }),
    ip: request.ip?.slice(0, 64) ?? null,
    userAgent: (Array.isArray(userAgent) ? userAgent[0] : userAgent)?.slice(
      0,
      255,
    ),
  };
};
