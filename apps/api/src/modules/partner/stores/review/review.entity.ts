import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Schedule } from '../schedule/schedule.entity';
import { Store } from '../store.entity';

export const REVIEW_SCHEDULE_UNIQUE_INDEX = 'uq_reviews_schedule';

@Entity('reviews')
@Index('idx_reviews_store_user', ['store.id', 'user.id'])
@Index('idx_reviews_store', ['store.id'])
// Uma avaliação por atendimento; as antigas, sem atendimento, ficam de fora
@Index(REVIEW_SCHEDULE_UNIQUE_INDEX, ['schedule'], {
  unique: true,
  where: '"scheduleId" IS NOT NULL',
})
export class Review extends BaseEntity {
  @Column({
    type: 'numeric',
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : value),
    },
  })
  rating: number;

  @Column({ type: 'varchar', nullable: true })
  comment: string;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Store, (store) => store.reviews, { onDelete: 'CASCADE' })
  store: Store;

  /**
   * Atendimento concluído que dá direito à avaliação. Nulo nas avaliações de
   * antes desta regra; se o atendimento sumir, a avaliação continua.
   */
  @ManyToOne(() => Schedule, { nullable: true, onDelete: 'SET NULL' })
  schedule: Schedule | null;

  /** Resposta pública da loja; nula enquanto ela não respondeu. */
  @Column({ type: 'varchar', length: 1000, nullable: true })
  reply: string | null;

  @Column({ type: 'timestamp', nullable: true })
  repliedAt: Date | null;
}
