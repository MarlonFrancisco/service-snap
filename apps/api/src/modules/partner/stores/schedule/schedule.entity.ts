import {
  Column,
  Entity,
  Exclusion,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Service } from '../category/service/service.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import {
  Booking,
  SCHEDULE_BOOKING_FK,
  SCHEDULE_BOOKING_INDEX,
} from './booking.entity';

export const SCHEDULE_OVERLAP_CONSTRAINT = 'excl_schedules_member_overlap';

// HH:MM em minutos. Conta com inteiros porque texto::time não é imutável, e o
// Postgres só aceita expressão imutável em constraint.
const minutesOf = (column: string) =>
  `substr("${column}", 1, 2)::int * 60 + substr("${column}", 4, 2)::int`;

/**
 * Última barreira contra dois atendimentos no mesmo horário: o mesmo
 * profissional, no mesmo dia, não pode ter intervalos que se cruzam. Cancelados
 * ficam de fora. Precisa da extensão `btree_gist` (ver `pnpm migrate:schedule-overlap`).
 */
export const SCHEDULE_OVERLAP_EXCLUSION = `USING gist (
  "storeMemberId" WITH =,
  "date" WITH =,
  int4range(${minutesOf('startTime')}, ${minutesOf('endTime')}) WITH &&
) WHERE ("status" <> 'cancelled' AND "startTime" IS NOT NULL AND "endTime" IS NOT NULL)`;

@Entity('schedules')
@Exclusion(SCHEDULE_OVERLAP_CONSTRAINT, SCHEDULE_OVERLAP_EXCLUSION)
@Index('idx_schedules_store', ['store.id'])
// As métricas e a agenda filtram sempre loja + intervalo de datas.
@Index('idx_schedules_store_date', ['store.id', 'date'])
@Index('idx_schedules_service', ['service.id'])
@Index('idx_schedules_user', ['user.id'])
@Index('idx_schedules_store_member', ['storeMember.id'])
// Busca de conflito e de disponibilidade: profissional + dia
@Index('idx_schedules_member_date', ['storeMember.id', 'date'])
@Index(SCHEDULE_BOOKING_INDEX, ['booking'])
export class Schedule extends BaseEntity {
  @Column({ type: 'char', length: 5, nullable: true })
  startTime: string;

  @Column({ type: 'char', length: 5, nullable: true })
  endTime: string;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ type: 'varchar', nullable: true })
  notes: string;

  /** Preço do serviço no momento da reserva. Nulo em agendamentos antigos. */
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value?: number | null) => value,
      from: (value?: string | null) => (value == null ? null : Number(value)),
    },
  })
  price: number | null;

  /** Moeda (ISO 4217) da loja no momento da reserva. */
  @Column({ type: 'char', length: 3, nullable: true })
  currency: string | null;

  @Column({
    type: 'enum',
    nullable: true,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  })
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';

  /**
   * Quando o cliente confirmou que vem, respondendo ao lembrete. Fora do
   * `status` porque o atendimento continua marcado; remarcar zera.
   */
  @Column({ type: 'timestamptz', nullable: true })
  presenceConfirmedAt: Date | null;

  @ManyToOne(() => StoreMember, (storeMember) => storeMember.schedules, {
    onDelete: 'CASCADE',
  })
  storeMember: StoreMember;

  @ManyToOne(() => Service, (service) => service.schedules, {
    onDelete: 'CASCADE',
  })
  service: Service;

  @ManyToOne(() => User, (user) => user.schedules, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Store, (store) => store.schedules, {
    onDelete: 'CASCADE',
  })
  store: Store;

  /** Visita a que este serviço pertence. Nulo em agendamentos antigos de um serviço. */
  @ManyToOne(() => Booking, (booking) => booking.schedules, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ foreignKeyConstraintName: SCHEDULE_BOOKING_FK })
  booking: Booking | null;
}
