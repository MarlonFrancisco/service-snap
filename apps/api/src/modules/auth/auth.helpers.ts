import type { ConfigService } from '@nestjs/config';

/** Sem segredo próprio, qualquer um assinaria tokens válidos: a API não sobe. */
export const getJwtSecret = (configService: ConfigService): string => {
  const secret = configService.get<string>('JWT_SECRET');

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
};
