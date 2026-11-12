import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { numericTransformer } from '../../../../utils/helpers/database.helpers';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import type { Checkout } from '../checkout/checkout.entity';
import type { CustomerPackage } from '../packages/customer-package.entity';
import { Store } from '../store.entity';
import { CashSession } from './cash-session.entity';
import type { TPaymentMethod } from './cash.types';

export const STORE_PAYMENT_PAID_AT_INDEX = 'idx_store_payments_store_paid_at';

/**
 * Registro do que a loja recebeu fora do app. Estornar marca `voidedAt` em vez
 * de apagar: o caixa fechado precisa continuar batendo com o histórico.
 */
@Entity('store_payments')
@Index(STORE_PAYMENT_PAID_AT_INDEX, ['store', 'paidAt'])
export class StorePayment extends BaseEntity {
  @Column({ type: 'varchar', length: 20 })
  method: TPaymentMethod;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  amount: number;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  paidAt: Date;

  @Column({ type: 'uuid', nullable: true })
  registeredById: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  notes: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  voidedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  voidedById: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  voidReason: string | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @ManyToOne(() => CashSession, { onDelete: 'SET NULL', nullable: true })
  cashSession: CashSession | null;

  @ManyToOne('Checkout', { onDelete: 'SET NULL', nullable: true })
  checkout: Checkout | null;

  @ManyToOne('CustomerPackage', { onDelete: 'SET NULL', nullable: true })
  customerPackage: CustomerPackage | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  customer: User | null;
}
