import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Service } from '../category/service/service.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';

@Entity('schedules')
@Index('idx_schedules_store', ['store.id'])
@Index('idx_schedules_service', ['service.id'])
@Index('idx_schedules_user', ['user.id'])
@Index('idx_schedules_store_member', ['storeMember.id'])
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
}
