import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { numericTransformer } from '../../../../utils/helpers/database.helpers';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Service } from '../category/service/service.entity';
import { Store } from '../store.entity';
import type { TLoyaltyRewardStatus, TLoyaltyRewardType } from './loyalty.types';

export const LOYALTY_REWARD_SEQUENCE_INDEX = 'uq_loyalty_rewards_sequence';

/**
 * Recompensa ganha. A regra vem copiada do programa da época. O índice único
 * por ciclo e número impede duas recompensas iguais se a contagem rodar junta.
 */
@Entity('loyalty_rewards')
@Index(
  LOYALTY_REWARD_SEQUENCE_INDEX,
  ['store', 'customer', 'cycleStartsOn', 'sequence'],
  { unique: true },
)
export class LoyaltyReward extends BaseEntity {
  @Column({ type: 'date' })
  cycleStartsOn: string;

  /** 1ª, 2ª... recompensa do ciclo. */
  @Column({ type: 'int' })
  sequence: number;

  @Column({ type: 'varchar', length: 20 })
  rewardType: TLoyaltyRewardType;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  rewardValue: number | null;

  @Column({ type: 'varchar', length: 160 })
  description: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  earnedAt: Date;

  @Column({ type: 'date', nullable: true })
  expiresOn: string | null;

  @Column({ type: 'varchar', length: 20, default: 'available' })
  status: TLoyaltyRewardStatus;

  @Column({ type: 'timestamptz', nullable: true })
  redeemedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  redeemedById: string | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  customer: User;

  @ManyToOne(() => Service, { onDelete: 'SET NULL', nullable: true })
  rewardService: Service | null;
}
