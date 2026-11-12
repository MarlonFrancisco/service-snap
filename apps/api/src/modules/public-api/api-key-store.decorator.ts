import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { TApiKeyContext } from '../partner/stores/api-keys/api-keys.types';

/** Loja da chave usada na requisição (posta pelo `ApiKeyGuard`). */
export const ApiKeyStore = createParamDecorator(
  (_: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<{ apiKey: TApiKeyContext }>().apiKey
      .storeId,
);
