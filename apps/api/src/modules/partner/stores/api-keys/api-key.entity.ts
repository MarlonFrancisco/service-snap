import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Store } from '../store.entity';

export const API_KEY_HASH_INDEX = 'uq_api_keys_key_hash';

/**
 * Chave da API pública de uma loja. Só o hash fica no banco: a chave inteira
 * aparece uma vez, na criação. `prefix` identifica a chave na tela.
 */
@Entity('api_keys')
@Index(API_KEY_HASH_INDEX, ['keyHash'], { unique: true })
export class ApiKey extends BaseEntity {
  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'varchar', length: 16 })
  prefix: string;

  @Column({ type: 'char', length: 64, select: false })
  keyHash: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: false })
  store: Store;
}
