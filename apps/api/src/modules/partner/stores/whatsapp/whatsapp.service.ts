import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { SaveWhatsappConfigDto } from './dto/save-whatsapp-config.dto';
import { WHATSAPP_REMINDER_TEMPLATE } from './whatsapp-reminder-template';
import { WhatsappConfig } from './whatsapp.entity';
import {
  buildDisplayNameCheck,
  buildIdsCheck,
  buildIdsSuggestions,
  buildSwappedIdsMessage,
  buildTokenCheck,
  buildWebhookCheck,
  getTokenAccountIds,
  isPhoneNumber,
  settle,
} from './whatsapp.helpers';
import type {
  IWhatsappInteractiveList,
  TMetaDebugToken,
  TMetaPhoneNumber,
  TWhatsappCheck,
} from './whatsapp.types';

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
  /** Uma conferência por credencial; só vem quando as três estão preenchidas. */
  checks?: TWhatsappCheck[];
};

export type TWhatsappTemplateSummary = {
  name: string;
  status: string;
  language: string;
  category?: string;
};

/** `MISSING` quando a WABA ainda não tem o template; os outros vêm da Meta. */
export type TWhatsappReminderTemplateStatus = {
  name: string;
  status: 'MISSING' | 'APPROVED' | 'PENDING' | 'REJECTED' | (string & {});
  rejectedReason?: string;
};

type TMetaTemplateRow = {
  name?: string;
  status?: string;
  language?: string;
  rejected_reason?: string;
};

/** Limite de contas consultadas para sugerir IDs: cada uma é uma chamada à Meta. */
const MAX_SUGGESTED_ACCOUNTS = 5;

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
    action:
      | 'testar o envio'
      | 'listar templates'
      | 'criar o template' = 'testar o envio',
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

  async sendTemplate(
    phoneNumberId: string,
    to: string,
    template: { name: string; language: string; bodyParams: string[] },
    accessToken: string,
  ) {
    return this.sendMessage(
      phoneNumberId,
      to,
      {
        type: 'template',
        template: {
          name: template.name,
          language: { code: template.language },
          components: [
            {
              type: 'body',
              parameters: template.bodyParams.map((text) => ({
                type: 'text',
                text,
              })),
            },
          ],
        },
      },
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
          name: true,
          timezone: true,
          address: true,
          city: true,
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

    const checks = await this.runCredentialChecks(config);
    const phone = checks.phone;
    const isReachable =
      checks.ids.state === 'ok' && checks.token.state !== 'error';
    const list = [checks.ids, checks.token, checks.webhook, checks.displayName];
    const firstError = list.find((check) => check.state === 'error');

    if (!config.isActive) {
      return {
        status: 'inactive',
        isActive: false,
        hasCredentials: true,
        message:
          'Integração desativada. Ative o WhatsApp para enviar mensagens.',
        checks: list,
      };
    }

    if (!isReachable || !phone.ok) {
      this.logger.warn(
        `WhatsApp status check failed for store ${storeId}: ${firstError?.message}`,
      );
      return {
        status: 'error',
        isActive: true,
        hasCredentials: true,
        message:
          firstError?.message || 'Não foi possível validar as credenciais.',
        checks: list,
      };
    }

    return {
      status: 'connected',
      isActive: true,
      hasCredentials: true,
      displayPhoneNumber: phone.data.display_phone_number,
      verifiedName: phone.data.verified_name,
      qualityRating: phone.data.quality_rating,
      message: 'Conectado à Meta WhatsApp Cloud API.',
      checks: list,
    };
  }

  /** Confere cada credencial em paralelo. Nenhuma chamada lança: a falha vira o resultado da conferência. */
  private async runCredentialChecks(config: WhatsappConfig) {
    const headers = { Authorization: `Bearer ${config.accessToken}` };
    const get = <T>(path: string, params: Record<string, unknown>) =>
      axios
        .get(`${this.baseUrl}/${path}`, { params, headers })
        .then(({ data }) => data as T);

    const [debug, phone, accountPhones, subscribedApps] = await Promise.all([
      // Um token pode consultar a si mesmo: validade, expiração e permissões.
      settle(
        get<{ data: TMetaDebugToken }>('debug_token', {
          input_token: config.accessToken,
        }).then((body) => body.data ?? {}),
      ),
      settle(
        get<TMetaPhoneNumber>(config.phoneNumberId, {
          fields:
            'display_phone_number,verified_name,quality_rating,name_status',
        }),
      ),
      settle(
        get<{ data?: { id?: string }[] }>(
          `${config.businessAccountId}/phone_numbers`,
          { fields: 'id', limit: 100 },
        ).then((body) => body.data ?? []),
      ),
      settle(
        get<{ data?: unknown[] }>(
          `${config.businessAccountId}/subscribed_apps`,
          {},
        ).then((body) => body.data ?? []),
      ),
    ]);

    const ids = buildIdsCheck(phone, accountPhones, config);
    if (ids.state === 'error') {
      // Procura os números que o token alcança para sugerir o par de IDs certo.
      // O debug_token nem sempre lista as contas: os IDs informados que são contas válidas também entram.
      const accountIds = [
        ...new Set([
          ...getTokenAccountIds(debug),
          ...(accountPhones.ok ? [config.businessAccountId] : []),
          ...(phone.ok && !isPhoneNumber(phone) ? [config.phoneNumberId] : []),
        ]),
      ].slice(0, MAX_SUGGESTED_ACCOUNTS);
      const accounts = await Promise.all(
        accountIds.map(async (businessAccountId) => ({
          businessAccountId,
          phones: await settle(
            get<{ data?: TMetaPhoneNumber[] }>(
              `${businessAccountId}/phone_numbers`,
              { fields: 'id,display_phone_number,verified_name', limit: 20 },
            ).then((body) => body.data ?? []),
          ),
        })),
      );
      const suggestions = buildIdsSuggestions(accounts, config);
      if (suggestions.length) ids.suggestions = suggestions;

      const isPhoneFieldAnAccount = accounts.some(
        (account) =>
          account.businessAccountId === config.phoneNumberId &&
          Boolean(account.phones.data?.length),
      );
      if (isPhoneFieldAnAccount) {
        ids.message = buildSwappedIdsMessage(config.phoneNumberId);
      }
    }

    return {
      phone,
      token: buildTokenCheck(debug, phone),
      ids,
      webhook: buildWebhookCheck(subscribedApps),
      displayName: buildDisplayNameCheck(phone),
    };
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
      await this.sendText(ready.phoneNumberId, phone, body, ready.accessToken);
      return {
        ok: true,
        to: phone,
        message: 'Mensagem de teste enviada.',
      };
    } catch (error: any) {
      const metaMessage = error.response?.data?.error?.message || error.message;
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
      const metaMessage = error.response?.data?.error?.message || error.message;
      this.logger.warn(
        `WhatsApp templates fetch failed for store ${storeId}: ${metaMessage}`,
      );
      throw new BadRequestException(
        metaMessage || 'Não foi possível listar templates da Meta.',
      );
    }
  }

  async getReminderTemplate(
    storeId: string,
  ): Promise<TWhatsappReminderTemplateStatus> {
    const config = await this.whatsappConfigRepository.findOne({
      where: { store: { id: storeId } },
    });
    const ready = this.assertSendableConfig(config, 'listar templates');

    try {
      return await this.findReminderTemplate(ready);
    } catch (error: any) {
      throw new BadRequestException(
        this.metaErrorMessage(error) ||
          'Não foi possível consultar o template do lembrete na Meta.',
      );
    }
  }

  /** Cria o template na WABA da loja só se ele ainda não existir. */
  async ensureReminderTemplate(
    storeId: string,
  ): Promise<TWhatsappReminderTemplateStatus> {
    const config = await this.whatsappConfigRepository.findOne({
      where: { store: { id: storeId } },
    });
    const ready = this.assertSendableConfig(config, 'criar o template');

    try {
      const current = await this.findReminderTemplate(ready);
      if (current.status !== 'MISSING') return current;

      const { name, language, category, header, body, example } =
        WHATSAPP_REMINDER_TEMPLATE;
      const { data } = await axios.post(
        `${this.baseUrl}/${ready.businessAccountId}/message_templates`,
        {
          name,
          language,
          category,
          components: [
            { type: 'HEADER', format: 'TEXT', text: header },
            {
              type: 'BODY',
              text: body,
              example: { body_text: [example] },
            },
          ],
        },
        { headers: { Authorization: `Bearer ${ready.accessToken}` } },
      );

      return { name, status: data?.status || 'PENDING' };
    } catch (error: any) {
      const metaMessage = this.metaErrorMessage(error);
      this.logger.warn(
        `WhatsApp reminder template failed for store ${storeId}: ${metaMessage}`,
      );
      throw new BadRequestException(
        metaMessage || 'Não foi possível criar o template do lembrete na Meta.',
      );
    }
  }

  /** Lança o erro da Meta: quem chama decide se isso para a operação. */
  async findReminderTemplate(
    config: Pick<WhatsappConfig, 'businessAccountId' | 'accessToken'>,
  ): Promise<TWhatsappReminderTemplateStatus> {
    const { name, language } = WHATSAPP_REMINDER_TEMPLATE;
    const { data } = await axios.get(
      `${this.baseUrl}/${config.businessAccountId}/message_templates`,
      {
        params: { name, fields: 'name,status,language,rejected_reason' },
        headers: { Authorization: `Bearer ${config.accessToken}` },
      },
    );

    // O filtro por nome da Meta não é exato: confere nome e idioma aqui
    const rows: TMetaTemplateRow[] = Array.isArray(data?.data) ? data.data : [];
    const row = rows.find(
      (item) => item.name === name && item.language === language,
    );

    if (!row) return { name, status: 'MISSING' };

    return {
      name,
      status: row.status || 'PENDING',
      ...(row.rejected_reason && row.rejected_reason !== 'NONE'
        ? { rejectedReason: row.rejected_reason }
        : {}),
    };
  }

  private metaErrorMessage(error: any): string | undefined {
    return error.response?.data?.error?.message || error.message;
  }
}
