import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../database/base.entity';
import { User } from '../users/user.entity';
import type { TSubscriptionStatus } from './subscription.types';

@Entity('subscriptions')
@Index('idx_subscriptions_user', ['user.id'])
@Index('uq_subscriptions_subscription_id', ['subscriptionId'], { unique: true })
export class Subscription extends BaseEntity {
  @ManyToOne(() => User, (user) => user.subscriptions)
  user: User;

  @Column({ type: 'varchar', nullable: true })
  subscriptionId: string;

  @Column({ type: 'varchar', nullable: true })
  status: TSubscriptionStatus;

  @Column({ type: 'varchar', nullable: true })
  priceId: string;

  @Column({ type: 'varchar', nullable: true })
  productId: string;

  @Column({ type: 'date', nullable: true })
  currentPeriodEnd: Date;

  @Column({ type: 'date', nullable: true })
  currentPeriodStart: Date;

  @Column({ type: 'jsonb', nullable: true })
  features: {
    PRO_LIMIT: number;
    RANK_TIER: 'TIER_1' | 'TIER_2' | 'TIER_3';
    SMS_REMINDER: boolean;
    UNIT_LIMIT: number;
    WHATSAPP_INTEGRATION: boolean;
    DASHBOARD_GENERAL_ACCESS: boolean;
    DASHBOARD_SALES_ACCESS: boolean;
    DASHBOARD_OPERATIONAL_ACCESS: boolean;
    DASHBOARD_CUSTOMERS_ACCESS: boolean;
  };
}
