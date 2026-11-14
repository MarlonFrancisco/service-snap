import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { WaitlistService } from './waitlist.service';

/** Filas do cliente logado em todas as lojas; sair de uma é pela rota da loja. */
@Controller('users/me/waitlist')
export class MyWaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Get()
  list(@CurrentUser('sub') userId: string) {
    return this.waitlistService.listAllForCustomer(userId);
  }
}
