import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { UsersService } from '../../../users/users.service';
import { GrantWhatsappConsentDto } from './dto/grant-whatsapp-consent.dto';
import { CHECKOUT_CONSENT_VERSION } from './whatsapp-consent.helpers';
import { WhatsappConsentService } from './whatsapp-consent.service';

/**
 * O próprio cliente aceita ou retira o WhatsApp de uma loja (#37). Sem guard
 * de loja: quem chama é o cliente, e só mexe no próprio consentimento.
 */
@Controller('partner/stores/:storeId/whatsapp-consent')
export class WhatsappConsentController {
  constructor(
    private readonly consentService: WhatsappConsentService,
    private readonly usersService: UsersService,
  ) {}

  /** Texto da caixa no checkout, no idioma da loja. */
  @Public()
  @Get('text')
  getText(
    @Param('storeId') storeId: string,
    @Query('version') version?: string,
  ) {
    return this.consentService.getCheckoutText(
      storeId,
      version || CHECKOUT_CONSENT_VERSION,
    );
  }

  @Get('me')
  findMine(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.consentService.findState(storeId, userId);
  }

  /** Vale para o telefone do cadastro: sem telefone não há a quem enviar. */
  @Put('me')
  async grantMine(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: GrantWhatsappConsentDto,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user?.telephone) {
      throw new BadRequestException('A phone number is required');
    }

    return this.consentService.grant({
      storeId,
      customerId: userId,
      phone: user.telephone,
      source: body.source,
      textVersion: body.textVersion,
    });
  }

  /** `?via=checkout` quando o cliente retira na caixa do checkout. */
  @Delete('me')
  @HttpCode(200)
  async revokeMine(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
    @Query('via') via?: string,
  ) {
    await this.consentService.revoke(
      storeId,
      userId,
      via === 'checkout' ? 'checkout' : 'profile',
    );

    return this.consentService.findState(storeId, userId);
  }
}
