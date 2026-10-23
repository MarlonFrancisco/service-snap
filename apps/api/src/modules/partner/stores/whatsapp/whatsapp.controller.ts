import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { StoreAccessGuard } from '../guards';
import { SaveWhatsappConfigDto } from './dto/save-whatsapp-config.dto';
import { TestWhatsappDto } from './dto/test-whatsapp.dto';
import { WhatsappService } from './whatsapp.service';

@Controller('partner/stores/:storeId/whatsapp')
@UseGuards(StoreAccessGuard)
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async saveConfig(
    @Body() body: SaveWhatsappConfigDto,
    @Param('storeId') storeId: string,
  ) {
    const config = await this.whatsappService.save(
      plainToInstance(SaveWhatsappConfigDto, {
        ...body,
        store: { id: storeId },
        webhookVerifyToken: this.configService.get('WHATSAPP_VERIFY_TOKEN'),
      }),
    );
    return config;
  }

  @Get()
  async getConfig(@Param('storeId') storeId: string) {
    const config = await this.whatsappService.findOne({
      store: { id: storeId },
    });

    if (!config) {
      throw new NotFoundException('Configuração do WhatsApp não encontrada');
    }

    return config;
  }

  @Get('status')
  async getStatus(@Param('storeId') storeId: string) {
    return this.whatsappService.getConnectionStatus(storeId);
  }

  @Get('templates')
  async getTemplates(@Param('storeId') storeId: string) {
    return this.whatsappService.listTemplates(storeId);
  }

  @Post('test')
  async sendTest(
    @Param('storeId') storeId: string,
    @Body() body: TestWhatsappDto,
  ) {
    return this.whatsappService.sendTestMessage(storeId, body.to);
  }
}
