import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../database/base.entity';
import { StoreMember } from '../../store-member/store-member.entity';

@Entity('blocked_times')
@Index(['storeMember', 'date', 'time'], { unique: true })
export class BlockedTime extends BaseEntity {
  @ManyToOne(() => StoreMember, (storeMember) => storeMember.blockedTimes, {
    onDelete: 'CASCADE',
  })
  storeMember: StoreMember;

  @Column({ type: 'date', nullable: false })
  date: Date;

  /** Início do bloqueio. */
  @Column({ type: 'char', length: 5, nullable: false })
  time: string;

  /** Fim do bloqueio ("24:00" fecha o dia). Nulo em registros de um slot só. */
  @Column({ type: 'char', length: 5, nullable: true })
  endTime: string | null;

  @Column({ type: 'boolean', default: false, nullable: true })
  isRecurring: boolean;

  @Column({
    type: 'enum',
    nullable: true,
    enum: [0, 1, 2, 3, 4, 5, 6],
  })
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
