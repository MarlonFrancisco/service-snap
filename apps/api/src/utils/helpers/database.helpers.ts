import { QueryFailedError } from 'typeorm';

const PG_UNIQUE_VIOLATION = '23505';

/** Insert ou update barrado por índice único (gravação concorrente ou duplicata). */
export const isUniqueViolation = (error: unknown) =>
  error instanceof QueryFailedError &&
  (error.driverError as { code?: string })?.code === PG_UNIQUE_VIOLATION;
