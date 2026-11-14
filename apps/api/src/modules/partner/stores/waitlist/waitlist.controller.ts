import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { UsersService } from '../../../users/users.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
import { WaitlistService } from './waitlist.service';

/**
 * Lista de espera do cliente logado no site. Pelo WhatsApp a entrada é feita
 * pelo bot, sem login.
 */
@Controller('partner/stores/:storeId/waitlist')
export class WaitlistController {
  constructor(
    private readonly waitlistService: WaitlistService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async join(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: JoinWaitlistDto,
  ) {
    const customer = await this.usersService.findById(userId);

    return this.waitlistService.join({
      storeId,
      serviceId: body.serviceId,
      storeMemberId: body.storeMemberId,
      date: body.date,
      customer,
      // Quem entra pelo site sempre tem e-mail; sem ele, tenta o WhatsApp
      channel: customer.email ? 'email' : 'whatsapp',
    });
  }

  @Get()
  list(@Param('storeId') storeId: string, @CurrentUser('sub') userId: string) {
    return this.waitlistService.listForCustomer(storeId, userId);
  }

  @Delete(':id')
  leave(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.waitlistService.leave(storeId, id, userId);
  }
}
