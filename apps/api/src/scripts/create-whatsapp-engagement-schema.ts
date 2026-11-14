import 'dotenv/config';
import { createConnection } from 'typeorm';

/**
 * Migração manual da Fase 2 do WhatsApp: confirmação de presença
 * (`schedules.presenceConfirmedAt` e `schedule_reminders.asksPresence`), número do bot para o link `wa.me`
 * (`whatsapp_configs.displayPhoneNumber`) e a tabela da lista de espera. Sem
 * argumento só confere o banco; com `--apply` cria o que falta. Pode rodar mais
 * de uma vez.
 */
const COLUMNS = [
  {
    table: 'schedules',
    column: 'presenceConfirmedAt',
    definition: 'timestamptz NULL',
  },
  {
    table: 'whatsapp_configs',
    column: 'displayPhoneNumber',
    definition: 'character varying NULL',
  },
  {
    table: 'schedule_reminders',
    column: 'asksPresence',
    definition: 'boolean NOT NULL DEFAULT false',
  },
];

const WAITLIST_TABLE = `
  CREATE TABLE IF NOT EXISTS "waitlist_entries" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    "date" date NOT NULL,
    "channel" character varying NOT NULL,
    "status" character varying NOT NULL DEFAULT 'waiting',
    "notifiedAt" timestamptz NULL,
    "storeId" uuid NOT NULL,
    "serviceId" uuid NOT NULL,
    "storeMemberId" uuid NULL,
    "userId" uuid NOT NULL,
    CONSTRAINT "PK_waitlist_entries" PRIMARY KEY ("id"),
    CONSTRAINT "FK_waitlist_entries_store" FOREIGN KEY ("storeId")
      REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "FK_waitlist_entries_service" FOREIGN KEY ("serviceId")
      REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "FK_waitlist_entries_store_member" FOREIGN KEY ("storeMemberId")
      REFERENCES "store_members"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "FK_waitlist_entries_user" FOREIGN KEY ("userId")
      REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
  )
`;

const WAITLIST_INDEXES = [
  `CREATE INDEX IF NOT EXISTS "idx_waitlist_entries_store_date"
     ON "waitlist_entries" ("storeId", "date", "status")`,
  `CREATE INDEX IF NOT EXISTS "idx_waitlist_entries_user"
     ON "waitlist_entries" ("userId")`,
];

async function createWhatsappEngagementSchema() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const shouldApply = process.argv.includes('--apply');
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    const missingColumns = [];

    for (const item of COLUMNS) {
      const [exists] = await connection.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = $1 AND column_name = $2`,
        [item.table, item.column],
      );
      if (!exists) missingColumns.push(item);
    }

    const [waitlistTable] = await connection.query(
      `SELECT to_regclass('waitlist_entries') AS "name"`,
    );
    const hasWaitlist = Boolean(waitlistTable?.name);

    console.log(
      `Colunas que faltam: ${
        missingColumns
          .map((item) => `${item.table}.${item.column}`)
          .join(', ') || 'nenhuma'
      }`,
    );
    console.log(`Tabela waitlist_entries: ${hasWaitlist ? 'existe' : 'falta'}`);

    if (!missingColumns.length && hasWaitlist) {
      // Índices podem faltar se a tabela nasceu pela sincronização com outro nome
      if (shouldApply) {
        for (const index of WAITLIST_INDEXES) await connection.query(index);
      }
      console.log('✅ Banco já está pronto');
      return;
    }

    if (!shouldApply) {
      console.log('Rode de novo com --apply para criar o que falta.');
      return;
    }

    await connection.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    for (const item of missingColumns) {
      await connection.query(
        `ALTER TABLE "${item.table}" ADD COLUMN IF NOT EXISTS "${item.column}" ${item.definition}`,
      );
      console.log(`✅ Coluna ${item.table}.${item.column} criada`);
    }

    await connection.query(WAITLIST_TABLE);
    for (const index of WAITLIST_INDEXES) await connection.query(index);
    console.log('✅ Tabela waitlist_entries pronta');
  } finally {
    await connection.close();
  }
}

void createWhatsappEngagementSchema();
