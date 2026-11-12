import { API_KEY_HASH_INDEX } from '../modules/partner/stores/api-keys/api-key.entity';
import { WEBHOOK_DELIVERY_ENDPOINT_INDEX } from '../modules/partner/stores/webhooks/webhook-delivery.entity';
import { addForeignKey, baseColumns, runSchemaScript } from './schema.helpers';

/** API pública e webhooks: `api_keys`, `webhook_endpoints`, `webhook_deliveries`. */
void runSchemaScript(
  'Chaves de API e webhooks prontos',
  ['api_keys', 'webhook_endpoints', 'webhook_deliveries'],
  async (db) => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS "api_keys" (
        ${baseColumns(db, 'api_keys')},
        "name" character varying(80) NOT NULL,
        "prefix" character varying(16) NOT NULL,
        "keyHash" character(64) NOT NULL,
        "lastUsedAt" TIMESTAMP,
        "revokedAt" TIMESTAMP,
        "createdById" uuid,
        "storeId" uuid NOT NULL
      )
    `);
    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "${API_KEY_HASH_INDEX}"
      ON "api_keys" ("keyHash")
    `);
    await addForeignKey(db, 'api_keys', 'storeId', 'stores', 'CASCADE');

    await db.query(`
      CREATE TABLE IF NOT EXISTS "webhook_endpoints" (
        ${baseColumns(db, 'webhook_endpoints')},
        "url" character varying(500) NOT NULL,
        "description" character varying(120),
        "events" jsonb NOT NULL DEFAULT '[]',
        "secretEncrypted" text NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "consecutiveFailures" integer NOT NULL DEFAULT 0,
        "storeId" uuid NOT NULL
      )
    `);
    await addForeignKey(
      db,
      'webhook_endpoints',
      'storeId',
      'stores',
      'CASCADE',
    );

    await db.query(`
      CREATE TABLE IF NOT EXISTS "webhook_deliveries" (
        ${baseColumns(db, 'webhook_deliveries')},
        "event" character varying(60) NOT NULL,
        "payload" jsonb NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "attempts" integer NOT NULL DEFAULT 0,
        "responseStatus" integer,
        "error" character varying(500),
        "deliveredAt" TIMESTAMP,
        "endpointId" uuid NOT NULL
      )
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS "${WEBHOOK_DELIVERY_ENDPOINT_INDEX}"
      ON "webhook_deliveries" ("endpointId", "created_at")
    `);
    await addForeignKey(
      db,
      'webhook_deliveries',
      'endpointId',
      'webhook_endpoints',
      'CASCADE',
    );
  },
);
