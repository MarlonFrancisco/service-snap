import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';

const digest = (value: string) => createHash('sha256').update(value).digest();

@Injectable()
export class CronSecretGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.configService.get<string>('CRON_SECRET');
    const { authorization } = context.switchToHttp().getRequest().headers;

    // Sem segredo configurado a rota fica fechada, nunca aberta
    if (
      !secret ||
      typeof authorization !== 'string' ||
      !timingSafeEqual(digest(authorization), digest(`Bearer ${secret}`))
    ) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
