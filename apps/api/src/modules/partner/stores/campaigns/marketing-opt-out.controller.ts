import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

/**
 * Link "Sair da lista" do e-mail de campanha. Fora de /partner e sem login:
 * quem tem o link assinado só tira aquele cliente da lista daquela loja.
 */
@Controller('marketing/opt-out')
export class MarketingOptOutController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get(':token')
  find(@Param('token') token: string) {
    return this.campaignsService.getOptOutByToken(token);
  }

  @Post(':token')
  @HttpCode(200)
  optOut(@Param('token') token: string) {
    return this.campaignsService.optOutByToken(token);
  }
}
