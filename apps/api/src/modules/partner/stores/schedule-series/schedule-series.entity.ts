import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Schedule } from '../schedule/schedule.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';

export const SCHEDULE_SERIES_ITEM_SCHEDULE_INDEX =
  'uq_schedule_series_items_schedule';

/**
 * Agendamento recorrente: a regra (a cada N semanas, mesmo horário) e as datas
 * geradas. Cada data é um agendamento comum; a série só os agrupa, sem coluna
 * nova em `schedules`.
 */
@Entity('schedule_series')
export class ScheduleSeries extends BaseEntity {
  @Column({ type: 'int' })
  intervalWeeks: number;

  @Column({ type: 'int' })
  occurrences: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'char', length: 5 })
  startTime: string;

  /** Serviços de cada data, na ordem do atendimento. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  serviceIds: string[];

  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @ManyToOne(() => StoreMember, { onDelete: 'CASCADE', nullable: false })
  storeMember: StoreMember;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  customer: User | null;

  @OneToMany(() => ScheduleSeriesItem, (item) => item.series)
  items: ScheduleSeriesItem[];
}

/** Um agendamento da série (cada serviço da data vira uma linha). */
@Entity('schedule_series_items')
@Index(SCHEDULE_SERIES_ITEM_SCHEDULE_INDEX, ['schedule'], { unique: true })
export class ScheduleSeriesItem extends BaseEntity {
  /** 1ª, 2ª... data da série. */
  @Column({ type: 'int' })
  occurrence: number;

  @ManyToOne(() => ScheduleSeries, (series) => series.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  series: ScheduleSeries;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE', nullable: false })
  schedule: Schedule;
}
