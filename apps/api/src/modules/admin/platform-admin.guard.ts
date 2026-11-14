import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { parseAdminEmails } from './admin.helpers';

/**
 * Admin da plataforma pela lista `PLATFORM_ADMIN_EMAILS`. Confere o e-mail atual
 * no banco, não o do token (pode ter mudado depois do login). Vem depois do
 * `JwtAuthGuard` e marca a requisição para a auditoria registrar `admin`.
 */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { sub?: string };
      isPlatformAdmin?: boolean;
    }>();
    const admins = parseAdminEmails(
      this.configService.get<string>('PLATFORM_ADMIN_EMAILS'),
    );
    const user =
      request.user?.sub &&
      (await this.userRepository.findOne({
        where: { id: request.user.sub, isDeleted: false },
        select: ['id', 'email'],
      }));

    if (!user?.email || !admins.has(user.email.toLowerCase())) {
      throw new ForbiddenException('Platform admin only');
    }

    request.isPlatformAdmin = true;

    return true;
  }
}
