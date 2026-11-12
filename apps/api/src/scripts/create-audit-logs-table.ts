import {
  AUDIT_LOG_ACTOR_INDEX,
  AUDIT_LOG_STORE_INDEX,
} from '../modules/audit/audit-log.entity';
import { baseColumns, runSchemaScript } from './schema.helpers';

/** Log de auditoria (`audit_logs`). Sem chave estrangeira, de propósito. */
void runSchemaScript('Log de auditoria pronto', ['audit_logs'], async (db) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS "audit_logs" (
      ${baseColumns(db, 'audit_logs')},
      "storeId" uuid,
      "actorType" character varying(20) NOT NULL,
      "actorUserId" uuid,
      "apiKeyId" uuid,
      "action" character varying(160) NOT NULL,
      "resourceType" character varying(60),
      "resourceId" character varying(64),
      "statusCode" integer,
      "metadata" jsonb,
      "ip" character varying(64),
      "userAgent" character varying(255)
    )
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS "${AUDIT_LOG_STORE_INDEX}"
    ON "audit_logs" ("storeId", "created_at")
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS "${AUDIT_LOG_ACTOR_INDEX}"
    ON "audit_logs" ("actorUserId", "created_at")
  `);
});
