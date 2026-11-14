import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Store } from '../store.entity';

// Nomes fixos, iguais aos de `pnpm migrate:schedule-rules`
export const STORE_HOLIDAY_UNIQUE = 'UQ_store_holidays_store_date';
export const STORE_HOLIDAY_STORE_FK = 'FK_store_holidays_store';

/** Dia em que a loja inteira não atende (feriado, recesso, evento). */
@Entity('store_holidays')
@Index(STORE_HOLIDAY_UNIQUE, ['store', 'date'], { unique: true })
export class StoreHoliday extends BaseEntity {
  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ foreignKeyConstraintName: STORE_HOLIDAY_STORE_FK })
  store: Store;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  name: string | null;
}
