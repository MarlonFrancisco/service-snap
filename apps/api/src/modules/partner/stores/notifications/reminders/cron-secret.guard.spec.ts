import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CronSecretGuard } from './cron-secret.guard';

const check = (secret: string | undefined, authorization?: string) =>
  new CronSecretGuard({ get: () => secret } as never).canActivate({
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization } }),
    }),
  } as never);

describe('CronSecretGuard', () => {
  it('accepts the configured bearer secret', () => {
    expect(check('segredo', 'Bearer segredo')).toBe(true);
  });

  it.each([
    ['a wrong secret', 'segredo', 'Bearer outro'],
    ['a missing header', 'segredo', undefined],
    ['the raw secret without Bearer', 'segredo', 'segredo'],
    ['any header when no secret is configured', undefined, 'Bearer undefined'],
  ])('rejects %s', (_name, secret, authorization) => {
    expect(() => check(secret, authorization)).toThrow(UnauthorizedException);
  });
});
