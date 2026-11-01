import 'dotenv/config';
import { createConnection } from 'typeorm';

/**
 * Migração manual: com `synchronize: false` em produção, a tabela dos lembretes
 * não nasce sozinha. Pode rodar mais de uma vez. Sem ela, só o cron de lembretes
 * falha: o resto da API não consulta esta tabela.
 */
async function createScheduleRemindersTable() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS "schedule_reminders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "channel" character varying NOT NULL,
        "appointmentKey" character varying NOT NULL,
        "status" character varying NOT NULL,
        "attempts" integer NOT NULL DEFAULT 1,
        "scheduleId" uuid NOT NULL,
        CONSTRAINT "UQ_schedule_reminders_slot" UNIQUE ("scheduleId", "channel", "appointmentKey"),
        CONSTRAINT "PK_schedule_reminders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_schedule_reminders_schedule" FOREIGN KEY ("scheduleId")
          REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    console.log('✅ Table schedule_reminders is ready');
  } finally {
    await connection.close();
  }
}

void createScheduleRemindersTable();
