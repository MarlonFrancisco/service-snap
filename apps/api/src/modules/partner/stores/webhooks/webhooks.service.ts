import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  decryptText,
  encryptText,
  generateToken,
  parseEncryptionKey,
} from '../../../../utils/helpers/crypto.helpers';
import { AuditService } from '../../../audit/audit.service';
import type {
  CreateWebhookEndpointDto,
  UpdateWebhookEndpointDto,
} from './dto/webhook-endpoint.dto';
import { WebhookDelivery } from './webhook-delivery.entity';
import { WebhookDispatchService } from './webhook-dispatch.service';
import { WebhookEndpoint } from './webhook-endpoint.entity';
import { assertWebhookUrl } from './webhooks.helpers';

const DELIVERIES_PAGE = 50;

const newSecret = () => `whsec_${generateToken(24)}`;

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly endpointRepository: Repository<WebhookEndpoint>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveryRepository: Repository<WebhookDelivery>,
    private readonly dispatchService: WebhookDispatchService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  list(storeId: string) {
    return this.endpointRepository.find({
      where: { store: { id: storeId } },
      order: { createdAt: 'DESC' },
    });
  }

  /** O segredo volta inteiro só aqui, na rotação e em `revealSecret`. */
  async create(storeId: string, dto: CreateWebhookEndpointDto) {
    await assertWebhookUrl(dto.url, this.allowPrivateUrls);

    const secret = newSecret();
    const { id } = await this.endpointRepository.save({
      url: dto.url,
      description: dto.description ?? null,
      events: [...new Set(dto.events)],
      secretEncrypted: encryptText(secret, this.encryptionKey),
      store: { id: storeId },
    });

    return { ...(await this.findInStore(storeId, id)), secret };
  }

  async update(storeId: string, id: string, dto: UpdateWebhookEndpointDto) {
    await this.findInStore(storeId, id);

    if (dto.url) await assertWebhookUrl(dto.url, this.allowPrivateUrls);

    await this.endpointRepository.update(id, {
      ...(dto.url && { url: dto.url }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.events && { events: [...new Set(dto.events)] }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      // Religar dá uma nova chance completa antes do desligamento automático
      ...(dto.isActive && { consecutiveFailures: 0 }),
    });

    return this.findInStore(storeId, id);
  }

  async remove(storeId: string, id: string) {
    await this.findInStore(storeId, id);
    await this.endpointRepository.delete(id);

    return { id };
  }

  /** Leitura do segredo vai para a auditoria: GET não passa pelo interceptor. */
  async revealSecret(storeId: string, id: string, userId: string) {
    const endpoint = await this.findInStore(storeId, id, true);

    await this.auditService.record({
      storeId,
      actorType: 'user',
      actorUserId: userId,
      action: 'webhook.secret.revealed',
      resourceType: 'webhooks',
      resourceId: id,
    });

    return {
      secret: decryptText(endpoint.secretEncrypted, this.encryptionKey),
    };
  }

  /** Troca o segredo; o antigo deixa de valer na hora. */
  async rotateSecret(storeId: string, id: string) {
    await this.findInStore(storeId, id);

    const secret = newSecret();
    await this.endpointRepository.update(id, {
      secretEncrypted: encryptText(secret, this.encryptionKey),
    });

    return { secret };
  }

  /** Evento de teste; espera o resultado para a tela mostrar na hora. */
  async ping(storeId: string, id: string) {
    return this.dispatchService.ping(
      await this.findInStore(storeId, id, true),
      storeId,
    );
  }

  async listDeliveries(storeId: string, id: string) {
    await this.findInStore(storeId, id);

    return this.deliveryRepository.find({
      where: { endpoint: { id } },
      order: { createdAt: 'DESC' },
      take: DELIVERIES_PAGE,
    });
  }

  async redeliver(storeId: string, id: string, deliveryId: string) {
    await this.findInStore(storeId, id);
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId, endpoint: { id } },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    await this.dispatchService.redeliver(delivery.id);

    return { id: delivery.id, status: 'queued' };
  }

  private async findInStore(storeId: string, id: string, withSecret = false) {
    const query = this.endpointRepository
      .createQueryBuilder('endpoint')
      .where('endpoint.id = :id', { id })
      .andWhere('endpoint.storeId = :storeId', { storeId });

    if (withSecret) query.addSelect('endpoint.secretEncrypted');

    const endpoint = await query.getOne();

    if (!endpoint) throw new NotFoundException('Webhook not found');

    return endpoint;
  }

  private get encryptionKey(): Buffer {
    const key = parseEncryptionKey(
      this.configService.get<string>('DATA_ENCRYPTION_KEY'),
    );

    if (!key) {
      throw new ServiceUnavailableException(
        'Data encryption is not configured',
      );
    }

    return key;
  }

  private get allowPrivateUrls() {
    return this.configService.get<string>('NODE_ENV') !== 'production';
  }
}
