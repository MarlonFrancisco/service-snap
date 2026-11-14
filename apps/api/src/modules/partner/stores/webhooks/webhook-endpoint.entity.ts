import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Store } from '../store.entity';
import type { TWebhookEvent } from './webhooks.types';

/**
 * Para onde a loja quer receber os eventos. O segredo precisa ser lido para
 * assinar cada envio, então fica cifrado (`DATA_ENCRYPTION_KEY`), não em hash.
 */
@Entity('webhook_endpoints')
export class WebhookEndpoint extends BaseEntity {
  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  events: TWebhookEvent[];

  @Column({ type: 'text', select: false })
  secretEncrypted: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /** Zera a cada entrega; desliga o endpoint ao chegar no limite. */
  @Column({ type: 'int', default: 0 })
  consecutiveFailures: number;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;
}
