import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { WhatsappConsentService } from './whatsapp-consent.service';

/**
 * Link "Deixar de receber por WhatsApp" dos e-mails. Fora de /partner e sem
 * login: o link assinado só retira aquele cliente daquela loja.
 */
@Controller('whatsapp/opt-out')
export class WhatsappOptOutController {
  constructor(private readonly consentService: WhatsappConsentService) {}

  @Get(':token')
  find(@Param('token') token: string) {
    return this.consentService.getOptOutByToken(token);
  }

  @Post(':token')
  @HttpCode(200)
  optOut(@Param('token') token: string) {
    return this.consentService.optOutByToken(token);
  }
}
