import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { SaveWhatsappConfigDto } from './dto/save-whatsapp-config.dto';
import { WhatsappConfig } from './whatsapp.entity';
import { IWhatsappInteractiveList } from './whatsapp.types';

export type TWhatsappConnectionStatus =
  | 'connected'
  | 'inactive'
  | 'incomplete'
  | 'error';

export type TWhatsappStatusResponse = {
  status: TWhatsappConnectionStatus;
  isActive: boolean;
  hasCredentials: boolean;
  displayPhoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
  message?: string;
};

export type TWhatsappTemplateSummary = {
  name: string;
  status: string;
  language: string;
  category?: string;
};

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly baseUrl = 'https://graph.facebook.com/v24.0';

  constructor(
    @InjectRepository(WhatsappConfig)
    private readonly whatsappConfigRepository: Repository<WhatsappConfig>,
    private readonly configService: ConfigService,
  ) {}

  private normalizePhone(to: string): string {
    return to.replace(/\D/g, '');
  }

  private assertSendableConfig(
    config: WhatsappConfig | null,
    action: 'testar o envio' | 'listar templates' = 'testar o envio',
  ): WhatsappConfig {
    if (
      !config?.phoneNumberId ||
      !config?.accessToken ||
      !config?.businessAccountId
    ) {
      throw new BadRequestException(
        `Configure Phone Number ID, Business Account ID e Access Token antes de ${action}.`,
      );
    }
    return config;
  }

  async sendMessage(
    phoneNumberId: string,
    to: string,
    message: any,
    accessToken: string,
  ) {
    try {
      const url = `${this.baseUrl}/${phoneNumberId}/messages`;
      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          ...message,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to send WhatsApp message to ${to}`,
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async sendText(
    phoneNumberId: string,
    to: string,
    text: string,
    accessToken: string,
  ) {
    return this.sendMessage(
      phoneNumberId,
      to,
      { type: 'text', text: { body: text } },
      accessToken,
    );
  }

  async sendInteractiveButtons(
    phoneNumberId: string,
    to: string,
    text: string,
    buttons: { id: string; title: string }[],
    accessToken: string,
  ) {
    return this.sendMessage(
      phoneNumberId,
      to,
      {
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text },
          action: {
            buttons: buttons.map((btn) => ({
              type: 'reply',
              reply: { id: btn.id, title: btn.title },
            })),
          },
        },
      },
      accessToken,
    );
  }

  async sendInteractiveList({
    phoneNumberId,
    to,
    headerText,
    bodyText,
    footerText,
    buttonText,
    sections,
    accessToken,
  }: IWhatsappInteractiveList) {
    return this.sendMessage(
      phoneNumberId,
      to,
      {
        type: 'interactive',
        interactive: {
          type: 'list',
          header: {
            type: 'text',
            text: headerText,
          },
          body: {
            text: bodyText,
          },
          footer: {
            text: footerText,
          },
          action: {
            button: buttonText,
            sections: sections,
          },
        },
      },
      accessToken,
    );
  }

  async save(config: SaveWhatsappConfigDto) {
    const configResult = await this.whatsappConfigRepository.save(config);

    return { ...configResult, store: config.store };
  }

  async findOne(config: Partial<SaveWhatsappConfigDto>) {
    const result = await this.whatsappConfigRepository.findOne({
      relations: ['store'],
      select: {
        store: {
          id: true,
          businessDays: true,
          openTime: true,
          closeTime: true,
          lunchStartTime: true,
          lunchEndTime: true,
        },
      },
      where: config,
    });

    return (
      result ||
      ({
        webhookVerifyToken: this.configService.get('WHATSAPP_VERIFY_TOKEN'),
      } as WhatsappConfig)
    );
  }

  async getConnectionStatus(storeId: string): Promise<TWhatsappStatusResponse> {
    const config = await this.whatsappConfigRepository.findOne({
      where: { store: { id: storeId } },
    });

    const hasCredentials = Boolean(
      config?.phoneNumberId && config?.accessToken && config?.businessAccountId,
    );

    if (!hasCredentials || !config) {
      return {
        status: 'incomplete',
        isActive: Boolean(config?.isActive),
        hasCredentials: false,
        message:
          'Preencha Phone Number ID, Business Account ID e Access Token para conectar.',
      };
    }

    if (!config.isActive) {
      return {
        status: 'inactive',
        isActive: false,
        hasCredentials: true,
        message: 'Integração desativada. Ative o WhatsApp para enviar mensagens.',
      };
    }

    try {
      const { data } = await axios.get(
        `${this.baseUrl}/${config.phoneNumberId}`,
        {
          params: {
            fields: 'display_phone_number,verified_name,quality_rating',
          },
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
          },
        },
      );

      return {
        status: 'connected',
        isActive: true,
        hasCredentials: true,
        displayPhoneNumber: data.display_phone_number,
        verifiedName: data.verified_name,
        qualityRating: data.quality_rating,
        message: 'Conectado à Meta WhatsApp Cloud API.',
      };
    } catch (error: any) {
      const metaMessage =
        error.response?.data?.error?.message || error.message;
      this.logger.warn(
        `WhatsApp status check failed for store ${storeId}: ${metaMessage}`,
      );
      return {
        status: 'error',
        isActive: true,
        hasCredentials: true,
        message: metaMessage || 'Não foi possível validar as credenciais.',
      };
    }
  }

  async sendTestMessage(storeId: string, to: string) {
    const config = await this.whatsappConfigRepository.findOne({
      where: { store: { id: storeId } },
    });
    const ready = this.assertSendableConfig(config);
    if (!ready.isActive) {
      throw new BadRequestException(
        'Ative a integração do WhatsApp antes de enviar o teste.',
      );
    }

    const phone = this.normalizePhone(to);
    if (phone.length < 10) {
      throw new BadRequestException(
        'Informe um telefone válido com DDI (ex.: 5511999999999).',
      );
    }

    const body =
      '✅ Teste ServiceSnap: sua integração WhatsApp está funcionando. Esta mensagem foi enviada pelo painel do parceiro.';

    try {
      await this.sendText(
        ready.phoneNumberId,
        phone,
        body,
        ready.accessToken,
      );
      return {
        ok: true,
        to: phone,
        message: 'Mensagem de teste enviada.',
      };
    } catch (error: any) {
      const metaMessage =
        error.response?.data?.error?.message || error.message;
      throw new BadRequestException(
        metaMessage || 'Falha ao enviar mensagem de teste.',
      );
    }
  }

  async listTemplates(storeId: string): Promise<TWhatsappTemplateSummary[]> {
    const config = await this.whatsappConfigRepository.findOne({
      where: { store: { id: storeId } },
    });
    const ready = this.assertSendableConfig(config, 'listar templates');

    try {
      const { data } = await axios.get(
        `${this.baseUrl}/${ready.businessAccountId}/message_templates`,
        {
          params: {
            fields: 'name,status,language,category',
            limit: 50,
          },
          headers: {
            Authorization: `Bearer ${ready.accessToken}`,
          },
        },
      );

      const rows = Array.isArray(data?.data) ? data.data : [];
      return rows.map(
        (row: {
          name?: string;
          status?: string;
          language?: string;
          category?: string;
        }) => ({
          name: row.name || '—',
          status: row.status || 'UNKNOWN',
          language: row.language || '—',
          category: row.category,
        }),
      );
    } catch (error: any) {
      const metaMessage =
        error.response?.data?.error?.message || error.message;
      this.logger.warn(
        `WhatsApp templates fetch failed for store ${storeId}: ${metaMessage}`,
      );
      throw new BadRequestException(
        metaMessage || 'Não foi possível listar templates da Meta.',
      );
    }
  }
}
