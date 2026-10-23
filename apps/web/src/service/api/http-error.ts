export class ApiHttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message || `Request failed with status ${status}`);
    this.name = 'ApiHttpError';
    this.status = status;
    this.body = body;
  }
}

export function isApiHttpError(error: unknown): error is ApiHttpError {
  return error instanceof ApiHttpError;
}

export function isNotFoundError(error: unknown): boolean {
  return isApiHttpError(error) && error.status === 404;
}
