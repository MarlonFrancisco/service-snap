import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { In, Repository } from 'typeorm';
import {
  decryptText,
  parseEncryptionKey,
} from '../../../../utils/helpers/crypto.helpers';
import {
  PUBLIC_SCHEDULE_RELATIONS,
  toPublicSchedule,
} from '../../../public-api/public-api.helpers';
import { QueueService } from '../../../queue/queue.service';
import type { TQueueAttempt } from '../../../queue/queue.types';
import { Schedule } from '../schedule/schedule.entity';
import { WebhookDelivery } from './webhook-delivery.entity';
import { WebhookEndpoint } from './webhook-endpoint.entity';
import {
  WEBHOOK_MAX_CONSECUTIVE_FAILURES,
  WEBHOOK_SIGNATURE_HEADER,
  WEBHOOK_TIMEOUT_MS,
  assertWebhookUrl,
  buildWebhookSignature,
} from './webhooks.helpers';
import type {
  TWebhookAttempt,
  TWebhookEvent,
  TWebhookPayload,
} from './webhooks.types';

/**
 * Envia os eventos aos endpoints das lojas. Sem dependência de guard nem de
 * agenda: a agenda importa este módulo, então ele não pode importá-la. Cada
 * entrega é um trabalho no QStash, que tenta de novo enquanto o endpoint falha.
 */
@Injectable()
export class WebhookDispatchService implements OnModuleInit {
  private readonly logger = new Logger(WebhookDispatchService.name);

  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly endpointRepository: Repository<WebhookEndpoint>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveryRepository: Repository<WebhookDelivery>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
  ) {}

  onModuleInit() {
    this.queueService.register('webhook.delivery', (data, attempt) =>
      this.deliverQueued(data.deliveryId, attempt),
    );
  }

  /** Uma reserva com vários serviços vira um evento só, com todas as linhas. */
  async emitScheduleEvent(
    event: TWebhookEvent,
    storeId: string,
    scheduleIds: string[],
  ) {
    if (!storeId || !scheduleIds.length) return;

    const hasEndpoints = await this.endpointRepository
      .createQueryBuilder('endpoint')
      .where('endpoint.storeId = :storeId', { storeId })
      .andWhere('endpoint.isActive = true')
      .andWhere('endpoint.events @> :event', {
        event: JSON.stringify([event]),
      })
      .getExists();

    // A maioria das lojas não tem webhook: nada de carregar a agenda à toa
    if (!hasEndpoints) return;

    const schedules = await this.scheduleRepository.find({
      where: { id: In(scheduleIds) },
      relations: PUBLIC_SCHEDULE_RELATIONS,
      order: { startTime: 'ASC' },
    });

    await this.dispatch(storeId, event, {
      schedules: schedules.map(toPublicSchedule),
    });
  }

  async dispatch(
    storeId: string,
    event: TWebhookEvent,
    data: Record<string, unknown>,
  ) {
    const endpoints = await this.endpointRepository
      .createQueryBuilder('endpoint')
      .addSelect('endpoint.secretEncrypted')
      .where('endpoint.storeId = :storeId', { storeId })
      .andWhere('endpoint.isActive = true')
      .andWhere('endpoint.events @> :event', {
        event: JSON.stringify([event]),
      })
      .getMany();

    const deliveries = await Promise.all(
      endpoints.map((endpoint) =>
        this.createDelivery(endpoint, storeId, event, { data }),
      ),
    );

    await this.enqueueDeliveries(deliveries.map((delivery) => delivery.id));
  }

  /** Evento `ping` para a loja testar o endpoint; espera o resultado. */
  async ping(endpoint: WebhookEndpoint, storeId: string) {
    const delivery = await this.createDelivery(endpoint, storeId, 'ping', {
      data: { message: 'ServiceSnap webhook test' },
    });
    const result = await this.attemptDelivery(endpoint, delivery, true);

    await this.trackHealth(endpoint, result.ok);

    return result;
  }

  /** Reenvio manual: mesmo `id` de evento, para quem recebe ignorar duplicata. */
  async redeliver(deliveryId: string) {
    await this.deliveryRepository.update(deliveryId, { status: 'pending' });
    await this.enqueueDeliveries([deliveryId]);
  }

  /** Chamado pela fila: uma tentativa só; as próximas ficam com o QStash. */
  private async deliverQueued(deliveryId: string, attempt: TQueueAttempt) {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
      relations: ['endpoint'],
    });

    if (!delivery || delivery.status === 'delivered') {
      return { status: delivery?.status ?? 'missing' };
    }

    const endpoint = await this.endpointRepository
      .createQueryBuilder('endpoint')
      .addSelect('endpoint.secretEncrypted')
      .where('endpoint.id = :id', { id: delivery.endpoint.id })
      .getOne();

    // Endpoint apagado ou desligado depois de publicar: não insiste
    if (!endpoint?.isActive) {
      await this.deliveryRepository.update(delivery.id, {
        status: 'failed',
        error: 'Endpoint disabled',
      });
      return { status: 'failed' };
    }

    const result = await this.attemptDelivery(
      endpoint,
      delivery,
      attempt.isLastAttempt,
    );

    if (!result.ok && !attempt.isLastAttempt) {
      // 503 para o QStash: a entrega volta mais tarde
      throw new ServiceUnavailableException(result.error ?? 'Webhook failed');
    }

    await this.trackHealth(endpoint, result.ok);

    return { status: result.ok ? 'delivered' : 'failed' };
  }

  /** QStash fora do ar: a entrega fica marcada, a loja vê e pode reenviar. */
  private async enqueueDeliveries(deliveryIds: string[]) {
    try {
      await this.queueService.enqueue(
        deliveryIds.map((deliveryId) => ({
          type: 'webhook.delivery' as const,
          data: { deliveryId },
        })),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Webhooks não publicados no QStash: ${message}`);
      await this.deliveryRepository.update(
        { id: In(deliveryIds) },
        { status: 'failed', error: `QStash: ${message}`.slice(0, 500) },
      );
    }
  }

  /** O id do evento é o da entrega: estável entre tentativas e reenvios. */
  private createDelivery(
    endpoint: WebhookEndpoint,
    storeId: string,
    event: TWebhookEvent,
    { data }: { data: Record<string, unknown> },
  ) {
    const id = randomUUID();

    return this.deliveryRepository.save({
      id,
      event,
      status: 'pending',
      attempts: 0,
      endpoint: { id: endpoint.id },
      payload: {
        id,
        type: event,
        createdAt: new Date().toISOString(),
        storeId,
        data,
      },
    });
  }

  /** Falha que ainda vai ser tentada de novo fica `pending`. */
  private async attemptDelivery(
    endpoint: WebhookEndpoint,
    delivery: WebhookDelivery,
    isLastAttempt: boolean,
  ): Promise<TWebhookAttempt> {
    const secret = this.readSecret(endpoint);
    const result: TWebhookAttempt = secret
      ? await this.post(endpoint.url, secret, delivery.payload)
      : { ok: false, status: null, error: 'Webhook secret unavailable' };

    await this.deliveryRepository.update(delivery.id, {
      attempts: () => '"attempts" + 1',
      status: result.ok ? 'delivered' : isLastAttempt ? 'failed' : 'pending',
      responseStatus: result.status,
      error: result.error?.slice(0, 500) ?? null,
      deliveredAt: result.ok ? new Date() : null,
    });

    return result;
  }

  private async post(
    url: string,
    secret: string,
    payload: TWebhookPayload,
  ): Promise<TWebhookAttempt> {
    const body = JSON.stringify(payload);

    try {
      // A cada envio: o DNS pode ter mudado desde o cadastro
      await assertWebhookUrl(url, this.allowPrivateUrls);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ServiceSnap-Webhooks/1.0',
          'ServiceSnap-Event': payload.type,
          'ServiceSnap-Delivery': payload.id,
          [WEBHOOK_SIGNATURE_HEADER]: buildWebhookSignature(secret, body),
        },
        body,
        redirect: 'manual',
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      });

      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        error: response.ok ? null : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        status: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /** Endpoint que falha sempre é desligado, para não gastar a função à toa. */
  private async trackHealth(endpoint: WebhookEndpoint, ok: boolean) {
    if (ok) {
      await this.endpointRepository.update(endpoint.id, {
        consecutiveFailures: 0,
      });
      return;
    }

    await this.endpointRepository
      .createQueryBuilder()
      .update()
      .set({
        consecutiveFailures: () => '"consecutiveFailures" + 1',
        isActive: () =>
          `CASE WHEN "consecutiveFailures" + 1 >= ${WEBHOOK_MAX_CONSECUTIVE_FAILURES} THEN false ELSE "isActive" END`,
      })
      .where('id = :id', { id: endpoint.id })
      .execute();
  }

  private readSecret(endpoint: WebhookEndpoint): string | null {
    const key = parseEncryptionKey(
      this.configService.get<string>('DATA_ENCRYPTION_KEY'),
    );

    try {
      return key && endpoint.secretEncrypted
        ? decryptText(endpoint.secretEncrypted, key)
        : null;
    } catch (error) {
      this.logger.error(
        `Segredo do webhook ${endpoint.id} ilegível`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }

  private get allowPrivateUrls() {
    return this.configService.get<string>('NODE_ENV') !== 'production';
  }
}
