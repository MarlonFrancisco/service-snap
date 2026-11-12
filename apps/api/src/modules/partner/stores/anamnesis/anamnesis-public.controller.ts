import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnamnesisService } from './anamnesis.service';
import { SubmitAnamnesisDto } from './dto/anamnesis.dto';

/**
 * Link que o cliente recebe. Fora de /partner e sem login: quem tem o link
 * assinado preenche a ficha daquele atendimento, mas não lê respostas.
 */
@Controller('anamnesis')
export class AnamnesisPublicController {
  constructor(private readonly anamnesisService: AnamnesisService) {}

  @Get(':token')
  getInvite(@Param('token') token: string) {
    return this.anamnesisService.getInvite(token);
  }

  @Post(':token')
  submit(@Param('token') token: string, @Body() dto: SubmitAnamnesisDto) {
    return this.anamnesisService.submit(token, dto);
  }
}
