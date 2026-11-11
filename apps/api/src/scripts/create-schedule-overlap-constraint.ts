import 'dotenv/config';
import { createConnection } from 'typeorm';
import {
  SCHEDULE_OVERLAP_CONSTRAINT,
  SCHEDULE_OVERLAP_EXCLUSION,
} from '../modules/partner/stores/schedule/schedule.entity';

/**
 * Migração manual da trava de sobreposição de agendamentos. Sem argumento só
 * confere o banco; com `--apply` cria a extensão e a constraint. Pode rodar mais
 * de uma vez. Rodar antes de subir a API com `DB_SYNCHRONIZE=true`: sem a
 * extensão `btree_gist` a sincronização falha ao criar a constraint.
 */
async function createScheduleOverlapConstraint() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const shouldApply = process.argv.includes('--apply');
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    // Horário fora do formato quebraria a conta em minutos da constraint
    const malformed = await connection.query(`
      SELECT "id", "date", "startTime", "endTime"
      FROM "schedules"
      WHERE "status" <> 'cancelled'
        AND "startTime" IS NOT NULL
        AND "endTime" IS NOT NULL
        AND ("startTime" !~ '^[0-9]{2}:[0-9]{2}$'
          OR "endTime" !~ '^[0-9]{2}:[0-9]{2}$'
          OR "endTime" < "startTime")
    `);

    const overlaps = await connection.query(`
      SELECT a."id" AS "first", b."id" AS "second", a."storeMemberId",
        a."date", a."startTime", a."endTime",
        b."startTime" AS "otherStart", b."endTime" AS "otherEnd"
      FROM "schedules" a
      JOIN "schedules" b
        ON a."storeMemberId" = b."storeMemberId"
        AND a."date" = b."date"
        AND a."id" < b."id"
      WHERE a."status" <> 'cancelled'
        AND b."status" <> 'cancelled'
        AND a."startTime" < b."endTime"
        AND b."startTime" < a."endTime"
      ORDER BY a."date", a."startTime"
    `);

    console.log(`Horários fora do formato: ${malformed.length}`);
    console.table(malformed);
    console.log(`Pares de agendamentos sobrepostos: ${overlaps.length}`);
    console.table(overlaps);

    if (malformed.length || overlaps.length) {
      console.log(
        '❌ Corrija ou cancele os agendamentos acima antes de criar a trava.',
      );
      process.exitCode = 1;
      return;
    }

    if (!shouldApply) {
      console.log('✅ Banco pronto. Rode de novo com --apply para criar a trava.');
      return;
    }

    await connection.query('CREATE EXTENSION IF NOT EXISTS btree_gist');

    const [existing] = await connection.query(
      `SELECT 1 FROM pg_constraint WHERE conname = $1`,
      [SCHEDULE_OVERLAP_CONSTRAINT],
    );

    if (existing) {
      console.log(`✅ Constraint ${SCHEDULE_OVERLAP_CONSTRAINT} já existe`);
      return;
    }

    await connection.query(`
      ALTER TABLE "schedules"
      ADD CONSTRAINT "${SCHEDULE_OVERLAP_CONSTRAINT}"
      EXCLUDE ${SCHEDULE_OVERLAP_EXCLUSION}
    `);
    console.log(`✅ Constraint ${SCHEDULE_OVERLAP_CONSTRAINT} criada`);
  } finally {
    await connection.close();
  }
}

void createScheduleOverlapConstraint();
