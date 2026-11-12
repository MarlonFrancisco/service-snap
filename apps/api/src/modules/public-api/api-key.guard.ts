import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { runInBackground } from '../../utils/helpers/background.helpers';
import { readApiKey } from '../partner/stores/api-keys/api-keys.helpers';
import { ApiKeysService } from '../partner/stores/api-keys/api-keys.service';
import type { TApiKeyContext } from '../partner/stores/api-keys/api-keys.types';

/**
 * A loja vem da chave, nunca da URL: uma integração só enxerga a própria
 * agenda. Põe `request.apiKey`, que a auditoria lê para saber quem agiu.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
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
    runInBackground('Último uso da chave de API', () =>
      this.apiKeysService.touch(apiKey.id),
    );

    return true;
  }
}
