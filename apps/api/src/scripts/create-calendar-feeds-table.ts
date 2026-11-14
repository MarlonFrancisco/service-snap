import 'dotenv/config';
import { createConnection } from 'typeorm';
import { CALENDAR_FEED_TOKEN_INDEX } from '../modules/partner/stores/calendar-feed/calendar-feed.entity';

/**
 * Migração manual dos links de agenda (Google Agenda por URL). Sem argumento
 * só confere o banco; com `--apply` cria a tabela. Pode rodar mais de uma vez.
 */
async function createCalendarFeedsTable() {
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
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_feeds'`,
    );

    console.log(`Tabela calendar_feeds: ${table ? 'já existe' : 'não existe'}`);

    if (!shouldApply) {
      console.log('Rode de novo com --apply para criar a tabela.');
      return;
    }

    // Mesmos nomes que o TypeORM daria, para o `synchronize` não recriar nada
    const naming = connection.namingStrategy;
    const primaryKey = naming.primaryKeyName('calendar_feeds', ['id']);
    // Um-para-um: o TypeORM chama a unicidade de "relation constraint" (REL_)
    const uniqueMember = naming.relationConstraintName('calendar_feeds', [
      'storeMemberId',
    ]);
    const foreignKey = naming.foreignKeyName(
      'calendar_feeds',
      ['storeMemberId'],
      'store_members',
      ['id'],
    );

    await connection.query(`
      CREATE TABLE IF NOT EXISTS "calendar_feeds" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "token" character varying(64) NOT NULL,
        "storeMemberId" uuid,
        CONSTRAINT "${uniqueMember}" UNIQUE ("storeMemberId"),
        CONSTRAINT "${primaryKey}" PRIMARY KEY ("id"),
        CONSTRAINT "${foreignKey}" FOREIGN KEY ("storeMemberId")
          REFERENCES "store_members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await connection.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "${CALENDAR_FEED_TOKEN_INDEX}"
      ON "calendar_feeds" ("token")
    `);

    console.log('✅ Tabela calendar_feeds pronta');
  } finally {
    await connection.close();
  }
}

void createCalendarFeedsTable();
