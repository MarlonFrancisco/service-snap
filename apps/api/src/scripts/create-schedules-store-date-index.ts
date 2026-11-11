import 'dotenv/config';
import { createConnection } from 'typeorm';

/**
 * Migração manual: com `synchronize: false` em produção, o índice composto de
 * `schedules` não nasce sozinho. Pode rodar mais de uma vez. Sem ele nada
 * quebra: as métricas só voltam a ler todo o histórico da loja a cada consulta.
 *
 * `CONCURRENTLY` não bloqueia escritas na tabela durante a criação.
 */
async function createSchedulesStoreDateIndex() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    await connection.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_schedules_store_date"
      ON "schedules" ("storeId", "date")
    `);
    console.log('✅ Index idx_schedules_store_date is ready');
  } finally {
    await connection.close();
  }
}

void createSchedulesStoreDateIndex();
