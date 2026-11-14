/** Chave da API pública da loja; a chave inteira nunca volta na lista. */
export interface IApiKey {
  id: string;
  name: string;
  /** `ssk_` + 8 caracteres: identifica a chave na tela. */
  prefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Resposta da criação: a única vez em que `key` aparece. */
export type TCreatedApiKey = Pick<
  IApiKey,
  'id' | 'name' | 'prefix' | 'createdAt'
> & { key: string };

export type TCreateApiKey = { name: string };
