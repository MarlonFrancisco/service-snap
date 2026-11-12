import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Service } from '../category/service/service.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import type { TWaitlistChannel, TWaitlistStatus } from './waitlist.types';

/**
 * Cliente esperando vagar horário num dia cheio. Um aviso por entrada: depois de
 * avisado, quem não conseguiu reservar entra de novo.
 */
@Entity('waitlist_entries')
// Quem espera num dia: consulta a cada cancelamento ou remarcação
@Index('idx_waitlist_entries_store_date', ['store', 'date', 'status'])
@Index('idx_waitlist_entries_user', ['user'])
export class WaitlistEntry extends BaseEntity {
  @Column({ type: 'date' })
  date: string;

  /** Por onde a pessoa entrou e prefere o aviso; o outro canal é a reserva. */
  @Column({ type: 'varchar' })
  channel: TWaitlistChannel;

  @Column({ type: 'varchar', default: 'waiting' })
  status: TWaitlistStatus;

  @Column({ type: 'timestamptz', nullable: true })
  notifiedAt: Date | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @ManyToOne(() => Service, { onDelete: 'CASCADE', nullable: false })
  service: Service;

  /** Sem profissional: serve qualquer um que faça o serviço. */
  @ManyToOne(() => StoreMember, { onDelete: 'CASCADE', nullable: true })
  storeMember: StoreMember | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  user: User;
}
