import {
  ANAMNESIS_RESPONSE_CUSTOMER_INDEX,
  ANAMNESIS_RESPONSE_SCHEDULE_INDEX,
} from '../modules/partner/stores/anamnesis/anamnesis-response.entity';
import { createTable, runSchemaScript } from './schema.helpers';

/**
 * Ficha de anamnese: `anamnesis_forms` e `anamnesis_responses`. As respostas
 * só existem cifradas (precisa de DATA_ENCRYPTION_KEY na API).
 */
void runSchemaScript(
  'Ficha de anamnese pronta',
  ['anamnesis_forms', 'anamnesis_responses'],
  async (db) => {
    await createTable(
      db,
      'anamnesis_forms',
      `"name" character varying(100) NOT NULL,
       "description" character varying(500),
       "fields" jsonb NOT NULL DEFAULT '[]',
       "version" integer NOT NULL DEFAULT '1',
       "serviceIds" jsonb NOT NULL DEFAULT '[]',
       "isActive" boolean NOT NULL DEFAULT true,
       "storeId" uuid NOT NULL`,
      [['storeId', 'stores', 'CASCADE']],
    );

    await createTable(
      db,
      'anamnesis_responses',
      `"formName" character varying(100) NOT NULL,
       "formVersion" integer NOT NULL,
       "fields" jsonb NOT NULL,
       "answersEncrypted" text NOT NULL,
       "consentAt" TIMESTAMP WITH TIME ZONE NOT NULL,
       "consentText" character varying(500) NOT NULL,
       "storeId" uuid NOT NULL,
       "formId" uuid,
       "scheduleId" uuid,
       "customerId" uuid NOT NULL`,
      [
        ['storeId', 'stores', 'CASCADE'],
        ['formId', 'anamnesis_forms', 'SET NULL'],
        ['scheduleId', 'schedules', 'SET NULL'],
        ['customerId', 'users', 'CASCADE'],
      ],
    );
    await db.query(`CREATE INDEX IF NOT EXISTS "${ANAMNESIS_RESPONSE_CUSTOMER_INDEX}"
      ON "anamnesis_responses" ("storeId", "customerId")`);
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS "${ANAMNESIS_RESPONSE_SCHEDULE_INDEX}"
      ON "anamnesis_responses" ("formId", "scheduleId") WHERE "scheduleId" IS NOT NULL`);
  },
);
