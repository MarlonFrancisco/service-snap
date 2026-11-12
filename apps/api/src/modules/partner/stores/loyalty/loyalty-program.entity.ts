import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { numericTransformer } from '../../../../utils/helpers/database.helpers';
import { BaseEntity } from '../../../database/base.entity';
import { Service } from '../category/service/service.entity';
import { Store } from '../store.entity';
import type { TLoyaltyRewardType } from './loyalty.types';

export const LOYALTY_PROGRAM_STORE_INDEX = 'uq_loyalty_programs_store';

/**
 * Um programa por loja: a cada `visitsRequired` atendimentos concluídos (dias
 * distintos) dentro do ciclo, o cliente ganha uma recompensa. Mudar a regra
 * começa um ciclo novo; recompensas já ganhas continuam valendo.
 */
@Entity('loyalty_programs')
@Index(LOYALTY_PROGRAM_STORE_INDEX, ['store'], { unique: true })
export class LoyaltyProgram extends BaseEntity {
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int' })
  visitsRequired: number;

  @Column({ type: 'varchar', length: 20 })
  rewardType: TLoyaltyRewardType;

  /** Percentual ou valor em reais; vazio no serviço grátis. */
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  rewardValue: number | null;

  /** Serviços que contam visita; vazio conta todos. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  eligibleServiceIds: string[];

  @Column({ type: 'int', nullable: true })
  rewardValidityDays: number | null;

  /** Início do ciclo (`YYYY-MM-DD`): só visitas a partir daqui contam. */
  @Column({ type: 'date' })
  cycleStartsOn: string;

  /** Um por loja: garantido pelo índice único, não pela relação. */
  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;

  @ManyToOne(() => Service, { onDelete: 'SET NULL', nullable: true })
  rewardService: Service | null;
}
