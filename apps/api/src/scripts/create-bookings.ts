import 'dotenv/config';
import { createConnection } from 'typeorm';
import {
  BOOKING_STORE_FK,
  BOOKING_USER_FK,
  SCHEDULE_BOOKING_FK,
  SCHEDULE_BOOKING_INDEX,
} from '../modules/partner/stores/schedule/booking.entity';

// Linhas salvas na mesma reserva: um `save` de várias linhas roda numa transação
// só, e o `now()` do Postgres é o mesmo durante a transação inteira.
const LEGACY_GROUPS = `
  SELECT "storeId", "userId", "storeMemberId", "date", "created_at",
    count(*)::int AS "rows"
  FROM "schedules"
  WHERE "bookingId" IS NULL AND "storeId" IS NOT NULL
  GROUP BY "storeId", "userId", "storeMemberId", "date", "created_at"
`;

/**
 * Migração manual do registro pai dos agendamentos (`bookings`). Sem argumento
 * só confere o banco; com `--apply` cria a tabela e a coluna e agrupa os
 * agendamentos antigos que foram salvos juntos. Pode rodar mais de uma vez.
 */
async function createBookings() {
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
      `SELECT to_regclass('public.bookings') AS "name"`,
    );
    const [column] = await connection.query(
      `SELECT 1 AS "exists" FROM information_schema.columns
       WHERE table_name = 'schedules' AND column_name = 'bookingId'`,
    );
    const pending = column
      ? await connection.query(LEGACY_GROUPS)
      : await connection.query(
          LEGACY_GROUPS.replace('"bookingId" IS NULL AND ', ''),
        );
    const rows = pending.reduce(
      (total: number, group: { rows: number }) => total + group.rows,
      0,
    );

    console.log(`Tabela bookings: ${table.name ? 'existe' : 'não existe'}`);
    console.log(`Coluna schedules.bookingId: ${column ? 'existe' : 'não existe'}`);
    console.log(
      `Agendamentos sem visita: ${rows}, em ${pending.length} visitas a criar`,
    );

    if (!shouldApply) {
      console.log('Rode de novo com --apply para aplicar.');
      return;
    }

    await connection.transaction(async (manager) => {
      await manager.query(`
        CREATE TABLE IF NOT EXISTS "bookings" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          "source" character varying(16) NOT NULL DEFAULT 'customer',
          "storeId" uuid,
          "userId" uuid,
          CONSTRAINT "PK_bookings" PRIMARY KEY ("id"),
          CONSTRAINT "${BOOKING_STORE_FK}" FOREIGN KEY ("storeId")
            REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "${BOOKING_USER_FK}" FOREIGN KEY ("userId")
            REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        )
      `);
      await manager.query(
        `CREATE INDEX IF NOT EXISTS "idx_bookings_store" ON "bookings" ("storeId")`,
      );
      await manager.query(
        `ALTER TABLE "schedules" ADD COLUMN IF NOT EXISTS "bookingId" uuid`,
      );

      const [fk] = await manager.query(
        `SELECT 1 FROM pg_constraint WHERE conname = $1`,
        [SCHEDULE_BOOKING_FK],
      );

      if (!fk) {
        await manager.query(`
          ALTER TABLE "schedules" ADD CONSTRAINT "${SCHEDULE_BOOKING_FK}"
          FOREIGN KEY ("bookingId") REFERENCES "bookings"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION
        `);
      }

      await manager.query(
        `CREATE INDEX IF NOT EXISTS "${SCHEDULE_BOOKING_INDEX}" ON "schedules" ("bookingId")`,
      );

      // Um CTE usado duas vezes é materializado: o mesmo id vai para a visita e
      // para as linhas dela
      await manager.query(`
        WITH "groups" AS (
          SELECT "storeId", "userId", "storeMemberId", "date", "created_at",
            uuid_generate_v4() AS "id"
          FROM (${LEGACY_GROUPS}) AS "legacy"
        ), "inserted" AS (
          INSERT INTO "bookings" ("id", "created_at", "updated_at", "storeId", "userId", "source")
          SELECT "id", "created_at", "created_at", "storeId", "userId", 'customer'
          FROM "groups"
          RETURNING "id"
        )
        UPDATE "schedules" AS "s" SET "bookingId" = "g"."id"
        FROM "groups" AS "g"
        WHERE "s"."bookingId" IS NULL
          AND "s"."storeId" = "g"."storeId"
          AND "s"."userId" IS NOT DISTINCT FROM "g"."userId"
          AND "s"."storeMemberId" IS NOT DISTINCT FROM "g"."storeMemberId"
          AND "s"."date" IS NOT DISTINCT FROM "g"."date"
          AND "s"."created_at" = "g"."created_at"
      `);
    });

    console.log('✅ Visitas prontas');
  } finally {
    await connection.close();
  }
}

void createBookings();
