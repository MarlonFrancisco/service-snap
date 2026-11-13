import type { TPageQuery } from './pagination.types';

export type TAuditActorType = 'user' | 'api_key' | 'admin' | 'system';

/** Uma linha do histórico de ações (loja ou plataforma). */
export interface IAuditLog {
  id: string;
  storeId: string | null;
  actorType: TAuditActorType;
  actorUserId: string | null;
  /** Nome ou e-mail de quem fez; `null` para integração e sistema. */
  actorName: string | null;
  apiKeyId: string | null;
  /** Ação de negócio (`webhook.secret.revealed`) ou rota (`POST /partner/...`). */
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  statusCode: number | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TAuditLogQuery = Omit<TPageQuery, 'search'> & {
  /** `YYYY-MM-DD` (UTC); a API só filtra com `from` e `to` juntos. */
  from?: string;
  to?: string;
  actorUserId?: string;
  /** Último trecho fixo da rota (`schedules`, `webhooks`...). */
  resourceType?: string;
  /** Só no painel da plataforma. */
  storeId?: string;
};
