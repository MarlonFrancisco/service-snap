import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { numericTransformer } from '../../../../utils/helpers/database.helpers';
import { BaseEntity } from '../../../database/base.entity';
import { Service } from '../category/service/service.entity';
import { StoreMember } from '../store-member/store-member.entity';
import { Store } from '../store.entity';
import type { TCommissionType } from './commissions.types';

export const COMMISSION_RULE_STORE_INDEX = 'idx_commission_rules_store_from';

/**
 * Regra com vigência. Sem profissional e sem serviço é o padrão da loja. Mudar
 * uma regra grava uma versão nova a partir de uma data: o relatório de meses
 * passados continua usando a regra que valia na data do atendimento.
 */
@Entity('commission_rules')
@Index(COMMISSION_RULE_STORE_INDEX, ['store', 'effectiveFrom'])
export class CommissionRule extends BaseEntity {
  @Column({ type: 'varchar', length: 10 })
  type: TCommissionType;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  value: number;

  /** `YYYY-MM-DD`: vale para atendimentos a partir deste dia. */
  @Column({ type: 'date' })
  effectiveFrom: string;

  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @ManyToOne(() => StoreMember, { onDelete: 'CASCADE', nullable: true })
  storeMember: StoreMember | null;

  @ManyToOne(() => Service, { onDelete: 'CASCADE', nullable: true })
  service: Service | null;
}
