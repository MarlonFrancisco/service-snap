import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '@upstash/qstash';
import { In, Repository } from 'typeorm';
import { isUniqueViolation } from '../../../../utils/helpers/database.helpers';
import {
  addDaysToDateKey,
  getStoreToday,
} from '../../../../utils/helpers/store-date.helpers';
import { Store } from '../store.entity';
import { toWhatsappRecipient } from '../whatsapp/whatsapp-reminder-template';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import {
  Campaign,
  CampaignRecipient,
  MarketingOptOut,
} from './campaign.entity';
import {
  CAMPAIGN_MESSAGE_PATH,
  CAMPAIGN_MESSAGE_RETRIES,
  MAX_CAMPAIGN_RECIPIENTS,
  QSTASH_BATCH_SIZE,
  buildCampaignParams,
  chunk,
} from './campaigns.helpers';
import type { TCampaignMessageJob, TInactiveCustomer } from './campaigns.types';
import type { CreateCampaignDto } from './dto/campaign.dto';

const DEFAULT_INACTIVE_DAYS = 60;

/**
 * Campanha de reativação. A criação só grava e publica no QStash (uma
 * mensagem por destinatário); o envio acontece quando o QStash chama a API de
 * volta, com novas tentativas por conta dele.
 */
@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(CampaignRecipient)
    private readonly recipientRepository: Repository<CampaignRecipient>,
    @InjectRepository(MarketingOptOut)
    private readonly optOutRepository: Repository<MarketingOptOut>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly whatsappService: WhatsappService,
    private readonly configService: ConfigService,
  ) {}

  /** Quem veio e não voltou: última visita antes do corte e nada marcado depois. */
  async findInactiveCustomers(
    storeId: string,
    days = DEFAULT_INACTIVE_DAYS,
  ): Promise<TInactiveCustomer[]> {
    const store = await this.storeRepository.findOneBy({ id: storeId });

    if (!store) throw new NotFoundException('Store not found');

    const today = getStoreToday(store);
    const cutoff = addDaysToDateKey(today, -days);
    const rows: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      telephone: string | null;
      email: string | null;
      lastVisit: string;
    }[] = await this.campaignRepository.query(
      `SELECT u.id, u.first_name AS "firstName", u.last_name AS "lastName",
              u.telephone, u.email, max(s.date)::text AS "lastVisit"
         FROM schedules s
         JOIN users u ON u.id = s."userId"
        WHERE s."storeId" = $1
          AND s.status IN ('completed', 'scheduled')
          AND u."isDeleted" IS NOT TRUE
          AND NOT EXISTS (
            SELECT 1 FROM marketing_opt_outs o
             WHERE o."storeId" = $1 AND o."customerId" = u.id)
        GROUP BY u.id
       HAVING max(s.date) < $2
        ORDER BY max(s.date) DESC
        LIMIT $3`,
      [storeId, cutoff, MAX_CAMPAIGN_RECIPIENTS],
    );

    return rows.map((row) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      hasWhatsapp: Boolean(toWhatsappRecipient(row.telephone, store.country)),
      hasEmail: Boolean(row.email),
      lastVisit: row.lastVisit,
      daysAway: Math.round(
        (Date.parse(today) - Date.parse(row.lastVisit)) / 86_400_000,
      ),
    }));
  }

  list(storeId: string) {
    return this.campaignRepository
      .createQueryBuilder('campaign')
      .loadRelationCountAndMap(
        'campaign.sentCount',
        'campaign.recipients',
        'sent',
        (query) => query.where("sent.status = 'sent'"),
      )
      .loadRelationCountAndMap(
        'campaign.failedCount',
        'campaign.recipients',
        'failed',
        (query) => query.where("failed.status = 'failed'"),
      )
      .where('campaign.storeId = :storeId', { storeId })
      .orderBy('campaign.createdAt', 'DESC')
      .getMany();
  }

  async findOne(storeId: string, id: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id, store: { id: storeId } },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    const recipients = await this.recipientRepository.find({
      where: { campaign: { id } },
      relations: ['customer'],
      order: { createdAt: 'ASC' },
    });

    return {
      ...campaign,
      recipients: recipients.map((recipient) => ({
        id: recipient.id,
        status: recipient.status,
        error: recipient.error,
        sentAt: recipient.sentAt,
        customer: {
          id: recipient.customer.id,
          firstName: recipient.customer.firstName,
          lastName: recipient.customer.lastName,
        },
      })),
    };
  }

  async create(storeId: string, dto: CreateCampaignDto, userId: string) {
    const qstash = this.qstashClient;
    await this.assertMarketingTemplate(storeId, dto.template.name);

    const inactive = await this.findInactiveCustomers(
      storeId,
      dto.inactiveDays,
    );
    const chosen = dto.customerIds ? new Set(dto.customerIds) : null;
    const audience = inactive.filter(
      (customer) =>
        customer.hasWhatsapp && (!chosen || chosen.has(customer.id)),
    );

    if (!audience.length) {
      throw new BadRequestException('No customer can receive this campaign');
    }

    const campaign = await this.campaignRepository.save({
      name: dto.name,
      channel: dto.channel,
      inactiveDays: dto.inactiveDays,
      template: dto.template,
      status: 'sending',
      recipientsCount: audience.length,
      createdById: userId,
      store: { id: storeId },
    });
    const recipients = await this.recipientRepository.save(
      audience.map((customer) => ({
        campaign: { id: campaign.id },
        customer: { id: customer.id },
      })),
    );

    await this.publish(qstash, recipients);

    return this.findOne(storeId, campaign.id);
  }

  /**
   * Chamado pelo QStash para um destinatário. Repetir é seguro: só envia o que
   * ainda está na fila. Erro antes da última tentativa volta 503 para o QStash
   * tentar de novo; na última, fica como falha.
   */
  async deliver({ recipientId }: TCampaignMessageJob, retried: number) {
    const recipient = await this.recipientRepository.findOne({
      where: { id: recipientId },
      relations: [
        'campaign',
        'campaign.store',
        'campaign.store.whatsappConfig',
        'customer',
      ],
    });

    if (!recipient || recipient.status !== 'queued') {
      return { status: recipient?.status ?? 'missing' };
    }

    const { campaign, customer } = recipient;
    const store = campaign.store;
    const phone = toWhatsappRecipient(customer.telephone, store.country);
    const optedOut = await this.optOutRepository.exists({
      where: { store: { id: store.id }, customer: { id: customer.id } },
    });

    if (optedOut || !phone || customer.isDeleted) {
      await this.finish(
        recipient,
        'skipped',
        optedOut ? 'opt-out' : 'no-phone',
      );
      return { status: 'skipped' };
    }

    try {
      const config = store.whatsappConfig;

      if (!config?.isActive) throw new Error('WhatsApp disconnected');

      await this.whatsappService.sendTemplate(
        config.phoneNumberId,
        phone,
        {
          name: campaign.template.name,
          language: campaign.template.language,
          bodyParams: buildCampaignParams(campaign.template, {
            customerName: customer.firstName || 'cliente',
            storeName: store.name || 'a loja',
          }),
        },
        config.accessToken,
      );
      await this.finish(recipient, 'sent');

      return { status: 'sent' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.recipientRepository.increment(
        { id: recipient.id },
        'attempts',
        1,
      );

      if (retried < CAMPAIGN_MESSAGE_RETRIES) {
        throw new ServiceUnavailableException(message);
      }

      await this.finish(recipient, 'failed', message);

      return { status: 'failed' };
    }
  }

  /** A loja anota que o cliente não quer mais campanhas. */
  async optOut(storeId: string, customerId: string) {
    try {
      await this.optOutRepository.insert({
        source: 'store',
        store: { id: storeId },
        customer: { id: customerId },
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }

    return { customerId, optedOut: true };
  }

  async optIn(storeId: string, customerId: string) {
    await this.optOutRepository.delete({
      store: { id: storeId },
      customer: { id: customerId },
    });

    return { customerId, optedOut: false };
  }

  private async publish(qstash: Client, recipients: CampaignRecipient[]) {
    const url = `${this.apiPublicUrl}${CAMPAIGN_MESSAGE_PATH}`;

    for (const group of chunk(recipients, QSTASH_BATCH_SIZE)) {
      try {
        await qstash.batchJSON(
          group.map((recipient) => ({
            url,
            body: { recipientId: recipient.id } satisfies TCampaignMessageJob,
            retries: CAMPAIGN_MESSAGE_RETRIES,
          })),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Campanha não publicada no QStash: ${message}`);
        await this.recipientRepository.update(
          { id: In(group.map((recipient) => recipient.id)) },
          { status: 'failed', error: `QStash: ${message}`.slice(0, 300) },
        );
      }
    }

    await this.closeIfDone(recipients[0]?.campaign?.id);
  }

  private async finish(
    recipient: CampaignRecipient,
    status: 'sent' | 'failed' | 'skipped',
    error?: string,
  ) {
    await this.recipientRepository.update(recipient.id, {
      status,
      error: error?.slice(0, 300) ?? null,
      sentAt: status === 'sent' ? new Date() : null,
    });
    await this.closeIfDone(recipient.campaign.id);
  }

  private async closeIfDone(campaignId?: string) {
    if (!campaignId) return;

    const pending = await this.recipientRepository.exists({
      where: { campaign: { id: campaignId }, status: 'queued' },
    });

    if (!pending) {
      await this.campaignRepository.update(campaignId, { status: 'done' });
    }
  }

  /** Fora da janela de 24h a Meta só entrega template aprovado, e campanha é marketing. */
  private async assertMarketingTemplate(storeId: string, name: string) {
    const templates = await this.whatsappService.listTemplates(storeId);
    const template = templates.find((candidate) => candidate.name === name);

    if (!template || template.status !== 'APPROVED') {
      throw new BadRequestException('Template not approved by Meta');
    }
    if (template.category && template.category !== 'MARKETING') {
      throw new BadRequestException('Campaigns need a MARKETING template');
    }
  }

  private get qstashClient() {
    const token = this.configService.get<string>('QSTASH_TOKEN');

    if (!token || !this.apiPublicUrl) {
      throw new ServiceUnavailableException('Campaign queue is not configured');
    }

    return new Client({
      token,
      baseUrl: this.configService.get<string>('QSTASH_URL') || undefined,
    });
  }

  private get apiPublicUrl() {
    return this.configService.get<string>('API_PUBLIC_URL')?.replace(/\/$/, '');
  }
}
