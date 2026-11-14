import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Store } from '../store.entity';

// Nomes fixos, iguais aos de `pnpm migrate:store-customers`
export const STORE_CUSTOMER_UNIQUE = 'UQ_store_customers_store_user';
export const STORE_CUSTOMER_STORE_FK = 'FK_store_customers_store';
export const STORE_CUSTOMER_USER_FK = 'FK_store_customers_user';

/**
 * Ficha do cliente numa loja: anotações e etiquetas da equipe. Quem agendou já
 * é cliente sem esta linha; ela nasce no cadastro manual ou na primeira nota.
 */
@Entity('store_customers')
@Index(STORE_CUSTOMER_UNIQUE, ['store', 'user'], { unique: true })
export class StoreCustomer extends BaseEntity {
  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ foreignKeyConstraintName: STORE_CUSTOMER_STORE_FK })
  store: Store;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ foreignKeyConstraintName: STORE_CUSTOMER_USER_FK })
  user: User;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  tags: string[];
}
