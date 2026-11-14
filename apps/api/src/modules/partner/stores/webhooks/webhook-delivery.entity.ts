import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { WebhookEndpoint } from './webhook-endpoint.entity';
import type {
  TWebhookDeliveryStatus,
  TWebhookEvent,
  TWebhookPayload,
} from './webhooks.types';

export const WEBHOOK_DELIVERY_ENDPOINT_INDEX =
  'idx_webhook_deliveries_endpoint_created';

/** Uma entrega de evento, com o resultado da última tentativa. */
@Entity('webhook_deliveries')
@Index(WEBHOOK_DELIVERY_ENDPOINT_INDEX, ['endpoint', 'createdAt'])
export class WebhookDelivery extends BaseEntity {
  @Column({ type: 'varchar', length: 60 })
  event: TWebhookEvent;

  @Column({ type: 'jsonb' })
  payload: TWebhookPayload;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: TWebhookDeliveryStatus;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'int', nullable: true })
  responseStatus: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  error: string | null;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @ManyToOne(() => WebhookEndpoint, { onDelete: 'CASCADE', nullable: false })
  endpoint: WebhookEndpoint;
}
