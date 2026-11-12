import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { numericTransformer } from '../../../../utils/helpers/database.helpers';
import { BaseEntity } from '../../../database/base.entity';
import { Store } from '../store.entity';
import type { TPaymentTotals } from './cash.types';

export const CASH_SESSION_OPEN_INDEX = 'uq_cash_sessions_store_open';

/**
 * Um caixa aberto por vez em cada loja (índice parcial). No fechamento ficam
 * gravados os totais e a diferença entre o dinheiro contado e o esperado.
 */
@Entity('cash_sessions')
@Index(CASH_SESSION_OPEN_INDEX, ['store'], {
  unique: true,
  where: '"closedAt" IS NULL',
})
export class CashSession extends BaseEntity {
  @Column({ type: 'timestamptz', default: () => 'now()' })
  openedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  openedById: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  openingAmount: number;

  @Column({ type: 'timestamptz', nullable: true })
  closedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  closedById: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  countedCash: number | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  expectedCash: number | null;

  /** Por forma de pagamento, gravado no fechamento. */
  @Column({ type: 'jsonb', nullable: true })
  totals: TPaymentTotals | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;
}
