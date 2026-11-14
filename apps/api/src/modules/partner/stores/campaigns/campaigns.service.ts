import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  createSignedToken,
  parseEncryptionKey,
  readSignedToken,
} from '../../../../utils/helpers/crypto.helpers';
import { isUniqueViolation } from '../../../../utils/helpers/database.helpers';
import {
  addDaysToDateKey,
  formatDateKey,
  getStoreToday,
} from '../../../../utils/helpers/store-date.helpers';
import { NotificationService } from '../../../notification/notification.service';
import { QSTASH_BATCH_SIZE, chunk } from '../../../queue/queue.helpers';
import { QueueService } from '../../../queue/queue.service';
import type { TQueueAttempt, TQueueJobMap } from '../../../queue/queue.types';
import { PLAN_FEATURE_REQUIRED, PlanFeatureGuard } from '../guards';
import { Store } from '../store.entity';
import { toWhatsappRecipient } from '../whatsapp/whatsapp-reminder-template';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import {
  Campaign,
  CampaignRecipient,
  MarketingOptOut,
} from './campaign.entity';
import {
  MAX_CAMPAIGN_RECIPIENTS,
  OPT_OUT_LINK_DAYS,
  buildCampaignParams,
  deriveOptOutLinkSecret,
  parseOptOutSubject,
  toMessageLines,
  toOptOutSubject,
} from './campaigns.helpers';
import type { TInactiveCustomer, TOptOutSubject } from './campaigns.types';
import type { CreateCampaignDto } from './dto/campaign.dto';

const DEFAULT_INACTIVE_DAYS = 60;

/**
 * Campanha de reativação. A criação só grava e publica no QStash (uma
 * mensagem por destinatário); o envio acontece quando o QStash chama a API de
 * volta, com novas tentativas por conta dele.
 */
@Injectable()
export class CampaignsService implements OnModuleInit {
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
    private readonly notificationService: NotificationService,
    private readonly planFeatureGuard: PlanFeatureGuard,
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.queueService.register('campaign.message', (data, attempt) =>
      this.deliver(data, attempt),
    );
  }

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
    // Sem QStash a campanha rodaria inteira dentro da requisição
    if (!this.queueService.isConfigured) {
      throw new ServiceUnavailableException('Campaign queue is not configured');
    }

    const isEmail = dto.channel === 'email';

    if (isEmail) {
      // Sem a chave o e-mail sairia sem o link de sair da lista
      void this.optOutSecret;
    } else {
      await this.assertWhatsappPlan(storeId);
      await this.assertMarketingTemplate(storeId, dto.template.name);
    }

    const inactive = await this.findInactiveCustomers(
      storeId,
      dto.inactiveDays,
    );
    const chosen = dto.customerIds ? new Set(dto.customerIds) : null;
    const audience = inactive.filter(
      (customer) =>
        (isEmail ? customer.hasEmail : customer.hasWhatsapp) &&
        (!chosen || chosen.has(customer.id)),
    );

    if (!audience.length) {
      throw new BadRequestException('No customer can receive this campaign');
    }

    const campaign = await this.campaignRepository.save({
      name: dto.name,
      channel: dto.channel,
      inactiveDays: dto.inactiveDays,
      template: isEmail ? null : dto.template,
      message: isEmail ? dto.message.trim() : null,
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

    await this.publish(recipients);

    return this.findOne(storeId, campaign.id);
  }

  /**
   * Chamado pelo QStash para um destinatário. Repetir é seguro: só envia o que
   * ainda está na fila. Erro antes da última tentativa volta 503 para o QStash
   * tentar de novo; na última, fica como falha.
   */
  async deliver(
    { recipientId }: TQueueJobMap['campaign.message'],
    { isLastAttempt }: TQueueAttempt,
  ) {
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
    const isEmail = campaign.channel === 'email';
    const phone = toWhatsappRecipient(customer.telephone, store.country);
    const optedOut = await this.optOutRepository.exists({
      where: { store: { id: store.id }, customer: { id: customer.id } },
    });
    const hasContact = isEmail ? Boolean(customer.email) : Boolean(phone);

    if (optedOut || !hasContact || customer.isDeleted) {
      await this.finish(
        recipient,
        'skipped',
        optedOut ? 'opt-out' : isEmail ? 'no-email' : 'no-phone',
      );
      return { status: 'skipped' };
    }

    try {
      if (isEmail) {
        await this.sendEmail(campaign, store, customer);
      } else {
        await this.sendWhatsapp(campaign, store, customer.firstName, phone);
      }
      await this.finish(recipient, 'sent');

      return { status: 'sent' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.recipientRepository.increment(
        { id: recipient.id },
        'attempts',
        1,
      );

      if (!isLastAttempt) {
        throw new ServiceUnavailableException(message);
      }

      await this.finish(recipient, 'failed', message);

      return { status: 'failed' };
    }
  }

  /** A loja anota que o cliente não quer mais campanhas. */
  async optOut(storeId: string, customerId: string) {
    await this.insertOptOut({ storeId, customerId }, 'store');

    return { customerId, optedOut: true };
  }

  /** Página do link do e-mail: diz de qual loja o cliente vai sair. */
  async getOptOutByToken(token: string) {
    const subject = this.readOptOutToken(token);
    const [storeName, optedOut] = await Promise.all([
      this.findStoreName(subject.storeId),
      this.optOutRepository.exists({
        where: {
          store: { id: subject.storeId },
          customer: { id: subject.customerId },
        },
      }),
    ]);

    return { storeName, optedOut };
  }

  /** O próprio cliente sai pelo link. Repetir não muda nada. */
  async optOutByToken(token: string) {
    const subject = this.readOptOutToken(token);
    const storeName = await this.findStoreName(subject.storeId);

    await this.insertOptOut(subject, 'email');

    return { storeName, optedOut: true };
  }

  async optIn(storeId: string, customerId: string) {
    await this.optOutRepository.delete({
      store: { id: storeId },
      customer: { id: customerId },
    });

    return { customerId, optedOut: false };
  }

  private async publish(recipients: CampaignRecipient[]) {
    for (const group of chunk(recipients, QSTASH_BATCH_SIZE)) {
      try {
        await this.queueService.enqueue(
          group.map((recipient) => ({
            type: 'campaign.message' as const,
            data: { recipientId: recipient.id },
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

  private async sendWhatsapp(
    campaign: Campaign,
    store: Store,
    firstName: string | null,
    phone: string,
  ) {
    const config = store.whatsappConfig;

    if (!config?.isActive) throw new Error('WhatsApp disconnected');

    await this.whatsappService.sendTemplate(
      config.phoneNumberId,
      phone,
      {
        name: campaign.template.name,
        language: campaign.template.language,
        bodyParams: buildCampaignParams(campaign.template, {
          customerName: firstName || 'cliente',
          storeName: store.name || 'a loja',
        }),
      },
      config.accessToken,
    );
  }

  private async sendEmail(
    campaign: Campaign,
    store: Store,
    customer: CampaignRecipient['customer'],
  ) {
    const lastVisit = await this.findLastVisit(store.id, customer.id);

    await this.notificationService.campaignMessage(customer.email, {
      storeName: store.name || 'a loja',
      customerName: customer.firstName || 'cliente',
      messageLines: toMessageLines(campaign.message ?? ''),
      bookingLink: `${this.frontendUrl}/booking/${store.id}`,
      lastVisit: lastVisit ? formatDateKey(lastVisit) : null,
      unsubscribeLink: this.buildOptOutLink({
        storeId: store.id,
        customerId: customer.id,
      }),
    });
  }

  /** Só atendimento concluído conta como visita. */
  private async findLastVisit(storeId: string, customerId: string) {
    const [row]: { lastVisit: string | null }[] =
      await this.campaignRepository.query(
        `SELECT max(date)::text AS "lastVisit" FROM schedules
          WHERE "storeId" = $1 AND "userId" = $2 AND status = 'completed'`,
        [storeId, customerId],
      );

    return row?.lastVisit ?? null;
  }

  private async insertOptOut(
    { storeId, customerId }: TOptOutSubject,
    source: MarketingOptOut['source'],
  ) {
    try {
      await this.optOutRepository.insert({
        source,
        store: { id: storeId },
        customer: { id: customerId },
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  private async findStoreName(storeId: string) {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
      select: { id: true, name: true },
    });

    if (!store) throw new GoneException('Opt-out link is no longer valid');

    return store.name;
  }

  private buildOptOutLink(subject: TOptOutSubject) {
    const expiresAt = new Date(Date.now() + OPT_OUT_LINK_DAYS * 86_400_000);
    const token = createSignedToken(
      this.optOutSecret,
      toOptOutSubject(subject),
      expiresAt,
    );

    return `${this.frontendUrl}/sair-da-lista/${token}`;
  }

  /** Link adulterado ou vencido: 410, como o da anamnese. */
  private readOptOutToken(token: string): TOptOutSubject {
    const subject = readSignedToken(this.optOutSecret, token);
    const parsed = subject && parseOptOutSubject(subject);

    if (!parsed) throw new GoneException('Opt-out link is invalid or expired');

    return parsed;
  }

  private get optOutSecret() {
    const key = parseEncryptionKey(
      this.configService.get<string>('DATA_ENCRYPTION_KEY'),
    );

    if (!key) {
      throw new ServiceUnavailableException(
        'Data encryption is not configured',
      );
    }

    return deriveOptOutLinkSecret(key);
  }

  private get frontendUrl() {
    return this.configService.get<string>('FRONTEND_URL')?.replace(/\/$/, '');
  }

  /** Campanha pelo WhatsApp depende do plano; e-mail, não. */
  private async assertWhatsappPlan(storeId: string) {
    const missing = await this.planFeatureGuard.getMissingFeatures(storeId, [
      'WHATSAPP_INTEGRATION',
    ]);

    if (missing.length) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        code: PLAN_FEATURE_REQUIRED,
        message:
          'Este recurso não está incluído no seu plano. Faça upgrade para liberar o acesso.',
        missingFeatures: missing,
      });
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
}
