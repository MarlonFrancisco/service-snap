import { isApiHttpError } from '../api';

export const ACCOUNT_HAS_ACTIVE_SUBSCRIPTION =
  'ACCOUNT_HAS_ACTIVE_SUBSCRIPTION';

/** 409 de quem precisa cancelar a assinatura antes de excluir a conta. */
export const isActiveSubscriptionConflict = (error: unknown) =>
  isApiHttpError(error) &&
  error.status === 409 &&
  !!error.body &&
  typeof error.body === 'object' &&
  (error.body as { code?: unknown }).code === ACCOUNT_HAS_ACTIVE_SUBSCRIPTION;

/** `servicesnap-dados-2026-11-13.json`, como a API sugere. */
export const getDataExportFilename = (now = new Date()) =>
  `servicesnap-dados-${now.toISOString().slice(0, 10)}.json`;
