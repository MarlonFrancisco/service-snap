import { QueryFailedError } from 'typeorm';

const PG_UNIQUE_VIOLATION = '23505';

/** Insert ou update barrado por índice único (gravação concorrente ou duplicata). */
export const isUniqueViolation = (error: unknown) =>
  error instanceof QueryFailedError &&
  (error.driverError as { code?: string })?.code === PG_UNIQUE_VIOLATION;

/**
 * `numeric` do Postgres chega como texto (para não perder precisão); dinheiro
 * aqui cabe em `number` com 2 casas. Use em `@Column({ transformer })`.
 */
export const numericTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value == null ? null : Number(value)),
};
