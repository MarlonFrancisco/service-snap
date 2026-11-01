import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { JwtPayload } from '../../auth/auth.service';

/** Só o próprio usuário acessa os favoritos de `users/:userId/favorites`. */
@Injectable()
export class FavoriteOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user?.sub || user.sub !== request.params.userId) {
      throw new ForbiddenException('You can only access your own favorites');
    }

    return true;
  }
}
