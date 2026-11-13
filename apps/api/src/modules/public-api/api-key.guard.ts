import {
  Injectable,
  Logger,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { readApiKey } from '../partner/stores/api-keys/api-keys.helpers';
import { ApiKeysService } from '../partner/stores/api-keys/api-keys.service';
import type { TApiKeyContext } from '../partner/stores/api-keys/api-keys.types';

/**
 * A loja vem da chave, nunca da URL: uma integração só enxerga a própria
 * agenda. Põe `request.apiKey`, que a auditoria lê para saber quem agiu.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, unknown>;
      apiKey?: TApiKeyContext;
    }>();
    const key = readApiKey(request.headers);
    const apiKey = key && (await this.apiKeysService.authenticate(key));

    if (!apiKey) throw new UnauthorizedException('Invalid API key');

    request.apiKey = apiKey;
    // No máximo um UPDATE a cada 5 minutos por chave; falhar não barra a integração
    await this.apiKeysService
      .touch(apiKey.id)
      .catch((error: unknown) =>
        this.logger.error(
          'Último uso da chave de API não registrado',
          error instanceof Error ? error.stack : String(error),
        ),
      );

    return true;
  }
}
