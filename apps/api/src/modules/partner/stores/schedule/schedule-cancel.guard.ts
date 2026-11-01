import { ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtPayload } from '../../../auth/auth.service';
import { StoreAccessGuard } from '../guards/store-access.guard';
import { Store } from '../store.entity';
import { StoreMemberService } from '../store-member/store-member.service';
import { Schedule } from './schedule.entity';

/**
 * Libera o cancelamento para quem tem acesso à loja e para o cliente dono do
 * agendamento, que cancela pela tela de perfil sem ter vínculo com a loja.
 */
@Injectable()
export class ScheduleCancelGuard extends StoreAccessGuard {
  constructor(
    storeMemberService: StoreMemberService,
    @InjectRepository(Store)
    storeRepository: Repository<Store>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {
    super(storeMemberService, storeRepository);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    const isCustomer =
      !!user?.sub &&
      (await this.scheduleRepository.exists({
        where: {
          id: request.params.id,
          store: { id: request.params.storeId },
          user: { id: user.sub },
        },
      }));

    return isCustomer || super.canActivate(context);
  }
}
