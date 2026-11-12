import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../../users/user.entity';
import { Schedule } from '../schedule/schedule.entity';
import { Store } from '../store.entity';
import { AnamnesisForm } from './anamnesis-form.entity';
import type { TAnamnesisField } from './anamnesis.types';

export const ANAMNESIS_RESPONSE_SCHEDULE_INDEX =
  'uq_anamnesis_responses_form_schedule';
export const ANAMNESIS_RESPONSE_CUSTOMER_INDEX =
  'idx_anamnesis_responses_store_customer';

/**
 * Ficha preenchida pelo cliente. As respostas são dado de saúde (LGPD art. 11):
 * só existem cifradas (`answersEncrypted`) e nunca saem em listagens.
 */
@Entity('anamnesis_responses')
@Index(ANAMNESIS_RESPONSE_SCHEDULE_INDEX, ['form', 'schedule'], {
  unique: true,
  where: '"scheduleId" IS NOT NULL',
})
@Index(ANAMNESIS_RESPONSE_CUSTOMER_INDEX, ['store', 'customer'])
export class AnamnesisResponse extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  formName: string;

  @Column({ type: 'int' })
  formVersion: number;

  /** Perguntas como estavam quando o cliente respondeu. */
  @Column({ type: 'jsonb' })
  fields: TAnamnesisField[];

  @Column({ type: 'text', select: false })
  answersEncrypted: string;

  /** Consentimento explícito para tratar dado de saúde, com o texto aceito. */
  @Column({ type: 'timestamptz' })
  consentAt: Date;

  @Column({ type: 'varchar', length: 500 })
  consentText: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @ManyToOne(() => AnamnesisForm, { onDelete: 'SET NULL', nullable: true })
  form: AnamnesisForm | null;

  @ManyToOne(() => Schedule, { onDelete: 'SET NULL', nullable: true })
  schedule: Schedule | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  customer: User;
}
