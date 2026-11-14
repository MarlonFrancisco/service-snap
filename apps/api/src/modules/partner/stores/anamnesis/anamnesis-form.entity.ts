import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Store } from '../store.entity';
import type { TAnamnesisField } from './anamnesis.types';

/**
 * Formulário configurável da loja. Perguntas e serviços não são dado pessoal:
 * ficam em claro. Mudar as perguntas sobe a versão; respostas antigas guardam
 * a versão e as perguntas da época.
 */
@Entity('anamnesis_forms')
export class AnamnesisForm extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  fields: TAnamnesisField[];

  @Column({ type: 'int', default: 1 })
  version: number;

  /** Serviços que pedem a ficha; vazio vale para todos. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  serviceIds: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;
}
