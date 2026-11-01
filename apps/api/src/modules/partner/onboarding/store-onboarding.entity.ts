import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Store } from '../stores/store.entity';
import type { TOnboardingStep } from './onboarding.types';

/**
 * Existe só para lojas criadas pelo assistente. Lojas antigas não têm linha,
 * então nunca são tratadas como rascunho.
 */
@Entity('store_onboardings')
export class StoreOnboarding extends BaseEntity {
  @OneToOne(() => Store, (store) => store.onboarding, { onDelete: 'CASCADE' })
  @JoinColumn()
  store: Store;

  @Column({ type: 'varchar', nullable: true })
  businessType: string;

  /** Próxima etapa a concluir; é para onde o parceiro volta ao retomar. */
  @Column({ type: 'varchar', default: 'hours' })
  step: TOnboardingStep;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  linkSharedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  checklistDismissedAt: Date | null;
}
