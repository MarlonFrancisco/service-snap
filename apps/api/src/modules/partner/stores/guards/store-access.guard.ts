import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtPayload } from '../../../auth/auth.service';
import { Store } from '../store.entity';
import { StoreMemberService } from '../store-member/store-member.service';

/**
 * Guard que valida se o usuário tem acesso à loja (qualquer role)
 *
 * O dono não precisa ser membro: a loja é criada sem `storeMembers`.
 *
 * @example
 * @Get(':storeId/details')
 * @UseGuards(JwtAuthGuard, StoreAccessGuard)
 * async getStoreDetails(@Param('storeId') storeId: string) {
 *   // Usuário tem acesso à loja (owner, manager, employee)
 * }
 */
@Injectable()
export class StoreAccessGuard implements CanActivate {
  constructor(
    private readonly storeMemberService: StoreMemberService,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // Extrai storeId de params ou body
    const storeId = request.params.storeId || request.body?.storeId;

    if (!storeId) {
      throw new ForbiddenException('Store ID is required');
    }

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    // Busca relação user-store
    const storeMember = await this.storeMemberService.findStoreMember(
      storeId as string,
      user.sub,
    );

    if (storeMember) {
      // Injeta dados extras no request para uso posterior
      request.storeMember = storeMember;
      request.storeMemberRole = storeMember.role;

      return true;
    }

    const isOwner = await this.storeRepository.exists({
      where: { id: storeId as string, owner: { id: user.sub } },
    });

    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this store');
    }

    request.storeMemberRole = 'owner';

    return true;
  }
}
