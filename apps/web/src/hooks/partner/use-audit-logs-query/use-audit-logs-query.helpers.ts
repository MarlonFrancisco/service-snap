import { isApiHttpError } from '@/service/api';

const NO_RETRY_STATUS = [400, 401, 403, 404];

/** Sem acesso ou pedido inválido não melhora tentando de novo. */
export const retryUnlessDenied = (failureCount: number, error: unknown) =>
  !(isApiHttpError(error) && NO_RETRY_STATUS.includes(error.status)) &&
  failureCount < 2;

export const isForbidden = (error: unknown) =>
  isApiHttpError(error) && error.status === 403;
