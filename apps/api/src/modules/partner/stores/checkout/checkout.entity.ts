import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { numericTransformer } from '../../../../utils/helpers/database.helpers';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { LoyaltyReward } from '../loyalty/loyalty-reward.entity';
import { CustomerPackageItem } from '../packages/customer-package.entity';
import { Schedule } from '../schedule/schedule.entity';
import { Store } from '../store.entity';

export const CHECKOUT_ITEM_SCHEDULE_INDEX = 'uq_checkout_items_schedule';
export const CHECKOUT_CLOSED_AT_INDEX = 'idx_checkouts_store_closed_at';

const money = {
  type: 'numeric' as const,
  precision: 12,
  scale: 2,
  default: 0,
  transformer: numericTransformer,
};

/**
 * Fechamento de uma visita: um ou mais atendimentos do mesmo cliente, os
 * pagamentos recebidos, a sessão de pacote usada e a recompensa resgatada.
 */
@Entity('checkouts')
@Index(CHECKOUT_CLOSED_AT_INDEX, ['store', 'closedAt'])
export class Checkout extends BaseEntity {
  @Column({ type: 'timestamptz', default: () => 'now()' })
  closedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  closedById: string | null;

  /** Preço reservado dos atendimentos que não saíram de pacote. */
  @Column(money)
  subtotal: number;

  /** Desconto manual mais o da recompensa. */
  @Column(money)
  discount: number;

  /** O que o cliente deveria pagar: `subtotal - discount`. */
  @Column(money)
  total: number;

  /** Soma dos pagamentos registrados (pode diferir do total, ex.: gorjeta). */
  @Column(money)
  received: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  customer: User | null;

  @ManyToOne(() => LoyaltyReward, { onDelete: 'SET NULL', nullable: true })
  loyaltyReward: LoyaltyReward | null;

  @OneToMany(() => CheckoutItem, (item) => item.checkout, { cascade: true })
  items: CheckoutItem[];
}

/**
 * Um atendimento fechado. `baseAmount` é a base da comissão: a parte do valor
 * recebido que cabe a ele, ou o valor de uma sessão do pacote.
 */
@Entity('checkout_items')
@Index(CHECKOUT_ITEM_SCHEDULE_INDEX, ['schedule'], { unique: true })
export class CheckoutItem extends BaseEntity {
  @Column(money)
  price: number;

  @Column(money)
  baseAmount: number;

  @ManyToOne(() => Checkout, (checkout) => checkout.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  checkout: Checkout;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE', nullable: false })
  schedule: Schedule;

  /** Sessão de pacote usada; desfazer o fechamento devolve a sessão. */
  @ManyToOne(() => CustomerPackageItem, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customerPackageItem: CustomerPackageItem | null;
}
