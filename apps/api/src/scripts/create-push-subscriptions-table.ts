import 'dotenv/config';
import { createConnection } from 'typeorm';
import { PUSH_ENDPOINT_UNIQUE_INDEX } from '../modules/push/push-subscription.entity';

/**
 * Migração manual das inscrições de notificação push. Sem argumento só confere
 * o banco; com `--apply` cria a tabela. Pode rodar mais de uma vez.
 */
async function createPushSubscriptionsTable() {
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
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'push_subscriptions'`,
    );

    console.log(
      `Tabela push_subscriptions: ${table ? 'já existe' : 'não existe'}`,
    );

    if (!shouldApply) {
      console.log('Rode de novo com --apply para criar a tabela.');
      return;
    }

    // Mesmos nomes que o TypeORM daria, para o `synchronize` não recriar nada
    const naming = connection.namingStrategy;
    const primaryKey = naming.primaryKeyName('push_subscriptions', ['id']);
    const foreignKey = naming.foreignKeyName(
      'push_subscriptions',
      ['userId'],
      'users',
      ['id'],
    );

    await connection.query(`
      CREATE TABLE IF NOT EXISTS "push_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "endpoint" character varying(1000) NOT NULL,
        "p256dh" character varying(255) NOT NULL,
        "auth" character varying(255) NOT NULL,
        "userId" uuid,
        CONSTRAINT "${primaryKey}" PRIMARY KEY ("id"),
        CONSTRAINT "${foreignKey}" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await connection.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "${PUSH_ENDPOINT_UNIQUE_INDEX}"
      ON "push_subscriptions" ("endpoint")
    `);

    console.log('✅ Tabela push_subscriptions pronta');
  } finally {
    await connection.close();
  }
}

void createPushSubscriptionsTable();
