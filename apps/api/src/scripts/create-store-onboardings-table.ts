import 'dotenv/config';
import { createConnection } from 'typeorm';

/**
 * Migração manual: com `synchronize: false` em produção, a tabela do onboarding
 * não nasce sozinha. Pode rodar mais de uma vez. Lojas existentes não recebem
 * linha de propósito: sem linha, a loja não é rascunho e segue como está.
 */
async function createStoreOnboardingsTable() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS "store_onboardings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "businessType" character varying,
        "step" character varying NOT NULL DEFAULT 'hours',
        "completedAt" TIMESTAMP,
        "linkSharedAt" TIMESTAMP,
        "checklistDismissedAt" TIMESTAMP,
        "storeId" uuid,
        CONSTRAINT "UQ_store_onboardings_store" UNIQUE ("storeId"),
        CONSTRAINT "PK_store_onboardings" PRIMARY KEY ("id"),
        CONSTRAINT "FK_store_onboardings_store" FOREIGN KEY ("storeId")
          REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    console.log('✅ Table store_onboardings is ready');
  } finally {
    await connection.close();
  }
}

void createStoreOnboardingsTable();
