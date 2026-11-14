import type { ApiKey } from './api-key.entity';

/** A chave inteira só volta nesta resposta. */
export type TCreatedApiKey = Pick<
  ApiKey,
  'id' | 'name' | 'prefix' | 'createdAt'
> & { key: string };

/** O que o guard da API pública põe na requisição. */
export type TApiKeyContext = { id: string; storeId: string };
