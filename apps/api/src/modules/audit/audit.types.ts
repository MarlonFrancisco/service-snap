export type TAuditActorType = 'user' | 'api_key' | 'admin' | 'system';

export type TAuditEntry = {
  storeId?: string | null;
  actorType: TAuditActorType;
  actorUserId?: string | null;
  apiKeyId?: string | null;
  /** Ação de negócio (`anamnesis.response.viewed`) ou rota (`PUT /partner/...`). */
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  statusCode?: number | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
};

/** O que o interceptor lê da requisição; `apiKey` vem do guard da API pública. */
export type TAuditedRequest = {
  method: string;
  url: string;
  ip?: string;
  route?: { path?: string };
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  user?: { sub?: string };
  apiKey?: { id: string; storeId: string };
  isPlatformAdmin?: boolean;
};

/** Mesmo formato de página da Fase 1 (`{ data, meta }`). */
export type TAuditLogPage<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};
