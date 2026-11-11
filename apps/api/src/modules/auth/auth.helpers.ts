import type { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import type { TUsageWindow } from './auth.types';

/** Códigos errados aceitos antes de o código ser descartado. */
export const AUTH_CODE_MAX_ATTEMPTS = 5;
/** Códigos enviados ao mesmo e-mail dentro da janela. */
export const AUTH_CODE_MAX_SENDS = 5;
export const AUTH_CODE_WINDOW_MS = 15 * 60 * 1000;

/** Soma um uso à janela corrente, ou abre outra se a anterior já venceu. */
export const bumpUsageWindow = (
  current: TUsageWindow | undefined,
  now = Date.now(),
): TUsageWindow =>
  current && current.resetAt > now
    ? { ...current, count: current.count + 1 }
    : { count: 1, resetAt: now + AUTH_CODE_WINDOW_MS };

/**
 * `lax`: o navegador não manda o cookie em POST vindo de outro site, o que
 * fecha o CSRF básico sem quebrar links que chegam de fora.
 */
export const buildSessionCookieOptions = (
  maxAgeMs: number,
  httpOnly: boolean,
): CookieOptions => ({
  httpOnly,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: maxAgeMs,
});

/** Sem segredo próprio, qualquer um assinaria tokens válidos: a API não sobe. */
export const getJwtSecret = (configService: ConfigService): string => {
  const secret = configService.get<string>('JWT_SECRET');

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
};
