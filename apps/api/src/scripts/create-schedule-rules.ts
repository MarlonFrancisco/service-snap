import 'dotenv/config';
import { createConnection } from 'typeorm';
import {
  STORE_HOLIDAY_STORE_FK,
  STORE_HOLIDAY_UNIQUE,
} from '../modules/partner/stores/holiday/holiday.entity';

/** Colunas novas da Fase 1 (agenda): tabela, coluna e definição. */
const COLUMNS = [
  ['stores', 'slotIntervalMinutes', 'integer NOT NULL DEFAULT 30'],
  ['stores', 'bufferMinutes', 'integer NOT NULL DEFAULT 0'],
  ['stores', 'minAdvanceMinutes', 'integer NOT NULL DEFAULT 0'],
  ['stores', 'maxAdvanceDays', 'integer NOT NULL DEFAULT 0'],
  ['stores', 'cancellationNoticeHours', 'integer NOT NULL DEFAULT 0'],
  ['stores', 'rescheduleNoticeHours', 'integer NOT NULL DEFAULT 0'],
  ['store_members', 'workingHours', 'jsonb'],
  ['blocked_times', 'endTime', 'character(5)'],
] as const;

/**
 * Migração manual das regras de agenda: regras e política na loja, horário por
 * profissional, fim do bloqueio e a tabela de feriados. Sem argumento só confere
 * o banco; com `--apply` cria o que falta e preenche o fim dos bloqueios antigos
 * (início + 30 min, a grade fixa de antes). Pode rodar mais de uma vez.
 */
async function createScheduleRules() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const shouldApply = process.argv.includes('--apply');
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    const existing: { table_name: string; column_name: string }[] =
      await connection.query(
        `SELECT table_name, column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = ANY($1)`,
        [[...new Set(COLUMNS.map(([table]) => table))]],
      );
    const missing = COLUMNS.filter(
      ([table, column]) =>
        !existing.some(
          (row) => row.table_name === table && row.column_name === column,
        ),
    );
    const [holidays] = await connection.query(
      `SELECT to_regclass('public.store_holidays') AS "table"`,
    );
    const hasEndTime = !missing.some(([, column]) => column === 'endTime');
    const [legacyBlocks] = hasEndTime
      ? await connection.query(
          `SELECT count(*)::int AS "count" FROM "blocked_times" WHERE "endTime" IS NULL`,
        )
      : await connection.query(
          `SELECT count(*)::int AS "count" FROM "blocked_times"`,
        );

    console.log(
      `Colunas que faltam: ${missing.map(([t, c]) => `${t}.${c}`).join(', ') || 'nenhuma'}`,
    );
    console.log(
      `Tabela store_holidays: ${holidays.table ? 'existe' : 'não existe'}`,
    );
    console.log(`Bloqueios sem fim: ${legacyBlocks.count}`);

    if (!shouldApply) {
      console.log('Rode de novo com --apply para aplicar.');
      return;
    }

    await connection.transaction(async (manager) => {
      for (const [table, column, definition] of missing) {
        await manager.query(
          `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" ${definition}`,
        );
      }

      await manager.query(`
        UPDATE "blocked_times"
        SET "endTime" = to_char(("time"::time + interval '30 minutes'), 'HH24:MI')
        WHERE "endTime" IS NULL AND "time" < '23:30'
      `);
      // Bloqueio que viraria o dia fecha às 24:00
      await manager.query(`
        UPDATE "blocked_times" SET "endTime" = '24:00'
        WHERE "endTime" IS NULL
      `);

      await manager.query(`
        CREATE TABLE IF NOT EXISTS "store_holidays" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          "date" date NOT NULL,
          "name" character varying(80),
          "storeId" uuid,
          CONSTRAINT "PK_store_holidays" PRIMARY KEY ("id"),
          CONSTRAINT "${STORE_HOLIDAY_STORE_FK}" FOREIGN KEY ("storeId")
            REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        )
      `);
      await manager.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "${STORE_HOLIDAY_UNIQUE}"
        ON "store_holidays" ("storeId", "date")
      `);
    });

    console.log('✅ Regras de agenda prontas');
  } finally {
    await connection.close();
  }
}

void createScheduleRules();
