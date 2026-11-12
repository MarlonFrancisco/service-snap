import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as webPush from 'web-push';
import { PushSubscriptionDto } from './dto/push-subscription.dto';
import { PushSubscription } from './push-subscription.entity';
import type { TPushPayload } from './push.types';

/** O serviço de push responde 404 ou 410 quando o aparelho desistiu da inscrição. */
const GONE_STATUSES = [404, 410];

/**
 * Notificações no navegador e no app instalável (Web Push). Sem as chaves
 * VAPID no ambiente, fica desligado e nada quebra: os avisos por e-mail
 * continuam saindo.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly publicKey?: string;
  private readonly enabled: boolean;

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subscriptionRepository: Repository<PushSubscription>,
    configService: ConfigService,
  ) {
    this.publicKey = configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = configService.get<string>('VAPID_SUBJECT');

    this.enabled = Boolean(this.publicKey && privateKey && subject);

    if (this.enabled) {
      webPush.setVapidDetails(subject, this.publicKey, privateKey);
    } else {
      this.logger.warn('VAPID keys not configured - push notifications disabled');
    }
  }

  /** O web precisa da chave pública para pedir a inscrição ao navegador. */
  getPublicKey(): { enabled: boolean; publicKey: string | null } {
    return {
      enabled: this.enabled,
      publicKey: this.enabled ? this.publicKey : null,
    };
  }

  /** Mesmo aparelho inscrito de novo (ou por outra pessoa) só atualiza a linha. */
  async subscribe(userId: string, dto: PushSubscriptionDto): Promise<void> {
    await this.subscriptionRepository.upsert(
      {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        user: { id: userId },
      },
      ['endpoint'],
    );
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.subscriptionRepository.delete({
      endpoint,
      user: { id: userId },
    });
  }

  /** Nunca rejeita: um aviso que não chega não pode desfazer o agendamento. */
  async sendToUsers(userIds: string[], payload: TPushPayload): Promise<void> {
    const ids = [...new Set(userIds.filter(Boolean))];

    if (!this.enabled || !ids.length) return;

    try {
      const subscriptions = await this.subscriptionRepository.find({
        where: { user: { id: In(ids) } },
      });

      await Promise.all(
        subscriptions.map((subscription) =>
          this.send(subscription, payload),
        ),
      );
    } catch (error) {
      this.logger.error(`Push para ${ids.join(', ')} falhou`, error);
    }
  }

  private async send(subscription: PushSubscription, payload: TPushPayload) {
    try {
      await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify(payload),
        // Aviso de agendamento perde o sentido depois de um dia
        { TTL: 24 * 60 * 60 },
      );
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;

      if (GONE_STATUSES.includes(statusCode)) {
        await this.subscriptionRepository.delete({ id: subscription.id });
        return;
      }

      this.logger.warn(
        `Push para a inscrição ${subscription.id} falhou (${statusCode ?? 'sem status'}): ${(error as Error).message}`,
      );
    }
  }
}
