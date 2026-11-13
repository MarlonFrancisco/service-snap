import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Store } from '../store.entity';
import { Schedule } from './schedule.entity';
import type { TBookingSource } from './schedule.types';

// Nomes fixos, iguais aos de `pnpm migrate:bookings`
export const BOOKING_STORE_FK = 'FK_bookings_store';
export const BOOKING_USER_FK = 'FK_bookings_user';
export const SCHEDULE_BOOKING_FK = 'FK_schedules_booking';
export const SCHEDULE_BOOKING_INDEX = 'idx_schedules_booking';

/**
 * Uma visita do cliente: os serviços marcados juntos. Cada serviço continua
 * sendo uma linha em `schedules` (métricas e lembretes leem de lá), e cancelar
 * ou remarcar age sobre todas as linhas do mesmo `booking`.
 */
@Entity('bookings')
@Index('idx_bookings_store', ['store'])
export class Booking extends BaseEntity {
  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ foreignKeyConstraintName: BOOKING_STORE_FK })
  store: Store;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ foreignKeyConstraintName: BOOKING_USER_FK })
  user: User | null;

  @Column({ type: 'varchar', length: 16, default: 'customer' })
  source: TBookingSource;

  @OneToMany(() => Schedule, (schedule) => schedule.booking)
  schedules: Schedule[];
}
