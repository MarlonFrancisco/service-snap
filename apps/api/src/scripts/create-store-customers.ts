import 'dotenv/config';
import { createConnection } from 'typeorm';
import {
  STORE_CUSTOMER_STORE_FK,
  STORE_CUSTOMER_UNIQUE,
  STORE_CUSTOMER_USER_FK,
} from '../modules/partner/stores/customer/customer.entity';

/**
 * Migração manual da ficha de clientes (`store_customers`: notas e etiquetas).
 * Sem argumento só confere o banco; com `--apply` cria a tabela. Pode rodar
 * mais de uma vez. Quem já agendou continua cliente sem linha nesta tabela.
 */
async function createStoreCustomers() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const shouldApply = process.argv.includes('--apply');
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    const [table] = await connection.query(
      `SELECT to_regclass('public.store_customers') AS "name"`,
    );

    console.log(
      `Tabela store_customers: ${table.name ? 'existe' : 'não existe'}`,
    );

    if (!shouldApply) {
      console.log('Rode de novo com --apply para aplicar.');
      return;
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS "store_customers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "notes" text,
        "tags" jsonb NOT NULL DEFAULT '[]',
        "storeId" uuid,
        "userId" uuid,
        CONSTRAINT "PK_store_customers" PRIMARY KEY ("id"),
        CONSTRAINT "${STORE_CUSTOMER_STORE_FK}" FOREIGN KEY ("storeId")
          REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "${STORE_CUSTOMER_USER_FK}" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await connection.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "${STORE_CUSTOMER_UNIQUE}"
      ON "store_customers" ("storeId", "userId")
    `);

    console.log('✅ Ficha de clientes pronta');
  } finally {
    await connection.close();
  }
}

void createStoreCustomers();
