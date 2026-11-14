import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../database/base.entity';
import { User } from '../users/user.entity';

export const PUSH_ENDPOINT_UNIQUE_INDEX = 'uq_push_subscriptions_endpoint';

/**
 * Um navegador ou celular que aceitou receber notificações. A mesma pessoa
 * pode ter vários (computador e celular). O endereço vem do serviço de push do
 * navegador e identifica o aparelho.
 */
@Entity('push_subscriptions')
@Index(PUSH_ENDPOINT_UNIQUE_INDEX, ['endpoint'], { unique: true })
export class PushSubscription extends BaseEntity {
  @Column({ type: 'varchar', length: 1000 })
  endpoint: string;

  /** Chaves que cifram a mensagem para este aparelho. */
  @Column({ type: 'varchar', length: 255 })
  p256dh: string;

  @Column({ type: 'varchar', length: 255 })
  auth: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
