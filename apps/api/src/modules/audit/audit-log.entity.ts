import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../database/base.entity';
import type { TAuditActorType } from './audit.types';

export const AUDIT_LOG_STORE_INDEX = 'idx_audit_logs_store_created';
export const AUDIT_LOG_ACTOR_INDEX = 'idx_audit_logs_actor_created';

/**
 * Registro só de inclusão de quem fez o quê. Sem chave estrangeira de propósito:
 * apagar loja ou anonimizar usuário não pode levar o histórico junto.
 */
@Entity('audit_logs')
@Index(AUDIT_LOG_STORE_INDEX, ['storeId', 'createdAt'])
@Index(AUDIT_LOG_ACTOR_INDEX, ['actorUserId', 'createdAt'])
export class AuditLog extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  storeId: string | null;

  @Column({ type: 'varchar', length: 20 })
  actorType: TAuditActorType;

  @Column({ type: 'uuid', nullable: true })
  actorUserId: string | null;

  @Column({ type: 'uuid', nullable: true })
  apiKeyId: string | null;

  @Column({ type: 'varchar', length: 160 })
  action: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  resourceType: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  resourceId: string | null;

  @Column({ type: 'int', nullable: true })
  statusCode: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;
}
