import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { setTimeout as sleep } from 'timers/promises';
import { In, Repository } from 'typeorm';
import { runInBackground } from '../../../../utils/helpers/background.helpers';
import {
  decryptText,
  parseEncryptionKey,
} from '../../../../utils/helpers/crypto.helpers';
import {
  PUBLIC_SCHEDULE_RELATIONS,
  toPublicSchedule,
} from '../../../public-api/public-api.helpers';
import { Schedule } from '../schedule/schedule.entity';
import { WebhookDelivery } from './webhook-delivery.entity';
import { WebhookEndpoint } from './webhook-endpoint.entity';
import {
  WEBHOOK_MAX_CONSECUTIVE_FAILURES,
  WEBHOOK_RETRY_DELAYS_MS,
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
 * agenda: a agenda importa este módulo, então ele não pode importá-la.
 */
@Injectable()
export class WebhookDispatchService {
  private readonly logger = new Logger(WebhookDispatchService.name);

  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly endpointRepository: Repository<WebhookEndpoint>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveryRepository: Repository<WebhookDelivery>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly configService: ConfigService,
  ) {}

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

    await Promise.all(
      endpoints.map(async (endpoint) => {
        const delivery = await this.createDelivery(endpoint, storeId, event, {
          data,
        });
        await this.deliver(endpoint, delivery);
      }),
    );
  }

  /** Evento `ping` para a loja testar o endpoint; espera o resultado. */
  async ping(endpoint: WebhookEndpoint, storeId: string) {
    const delivery = await this.createDelivery(endpoint, storeId, 'ping', {
      data: { message: 'ServiceSnap webhook test' },
    });

    return this.deliver(endpoint, delivery, 1);
  }

  /** Reenvio manual: mesmo `id` de evento, para quem recebe ignorar duplicata. */
  redeliverInBackground(endpoint: WebhookEndpoint, delivery: WebhookDelivery) {
    runInBackground(`Reenvio do webhook ${delivery.id}`, () =>
      this.deliver(endpoint, delivery),
    );
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

  private async deliver(
    endpoint: WebhookEndpoint,
    delivery: WebhookDelivery,
    maxAttempts = WEBHOOK_RETRY_DELAYS_MS.length + 1,
  ): Promise<TWebhookAttempt> {
    const secret = this.readSecret(endpoint);
    let result: TWebhookAttempt = {
      ok: false,
      status: null,
      error: 'Webhook secret unavailable',
    };

    for (let attempt = 0; secret && attempt < maxAttempts; attempt += 1) {
      if (attempt > 0) await sleep(WEBHOOK_RETRY_DELAYS_MS[attempt - 1]);

      result = await this.post(endpoint.url, secret, delivery.payload);
      await this.deliveryRepository.update(delivery.id, {
        attempts: delivery.attempts + attempt + 1,
        status: result.ok ? 'delivered' : 'failed',
        responseStatus: result.status,
        error: result.error?.slice(0, 500) ?? null,
        deliveredAt: result.ok ? new Date() : null,
      });

      if (result.ok) break;
    }

    await this.trackHealth(endpoint, result.ok);

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
