import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Service } from '../category/service/service.entity';
import { Schedule } from '../schedule/schedule.entity';
import type { TWorkingHours } from '../../../../utils/helpers/schedule.types';
import { Store } from '../store.entity';
import { BlockedTime } from './blocked-time/blocked-time.entity';

@Entity('store_members')
@Index(['user', 'store'], { unique: true })
export class StoreMember extends BaseEntity {
  @ManyToOne(() => User, (user) => user.storeMembers, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Store, (store) => store.storeMembers, {
    onDelete: 'CASCADE',
  })
  store: Store;

  @Column({
    type: 'enum',
    nullable: true,
    enum: ['owner', 'manager', 'professional'],
  })
  role: 'owner' | 'manager' | 'professional';

  @Column({ type: 'boolean', nullable: true, default: false })
  isActive: boolean;

  @Column({ type: 'boolean', nullable: true, default: false })
  isDeleted: boolean;

  /** Horário próprio por dia da semana. Nulo segue o horário da loja. */
  @Column({ type: 'jsonb', nullable: true })
  workingHours: TWorkingHours | null;

  @ManyToMany(() => Service, (service) => service.storeMembers)
  @JoinTable({
    name: 'store_members_services',
    joinColumn: {
      name: 'store_member_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'service_id',
      referencedColumnName: 'id',
    },
  })
  services: Service[];

  @OneToMany(() => Schedule, (schedule) => schedule.storeMember)
  schedules: Schedule[];

  @OneToMany(() => BlockedTime, (blockedTime) => blockedTime.storeMember)
  blockedTimes: BlockedTime[];
}
