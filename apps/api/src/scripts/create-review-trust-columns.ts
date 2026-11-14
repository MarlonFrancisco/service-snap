import 'dotenv/config';
import { createConnection } from 'typeorm';
import { REVIEW_SCHEDULE_UNIQUE_INDEX } from '../modules/partner/stores/review/review.entity';

/**
 * Migração manual das avaliações confiáveis: liga cada avaliação a um
 * atendimento (uma por atendimento) e guarda a resposta da loja. Sem argumento
 * só confere o banco; com `--apply` cria colunas, chave estrangeira e índice.
 * Pode rodar mais de uma vez. As avaliações antigas ficam sem atendimento.
 */
async function createReviewTrustColumns() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const shouldApply = process.argv.includes('--apply');
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    const columns: { column_name: string }[] = await connection.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'reviews' AND column_name IN ('scheduleId', 'reply', 'repliedAt')`,
    );
    const [{ count }] = await connection.query(
      `SELECT count(*)::int AS count FROM reviews`,
    );

    console.log(
      `Colunas já existentes: ${columns.map((c) => c.column_name).join(', ') || 'nenhuma'}`,
    );
    console.log(`Avaliações no banco (ficam sem atendimento ligado): ${count}`);

    if (!shouldApply) {
      console.log('Rode de novo com --apply para criar as colunas.');
      return;
    }

    // Mesmo nome que o TypeORM daria, para o `synchronize` não recriar a chave
    const foreignKey = connection.namingStrategy.foreignKeyName(
      'reviews',
      ['scheduleId'],
      'schedules',
      ['id'],
    );

    await connection.query(`
      ALTER TABLE "reviews"
        ADD COLUMN IF NOT EXISTS "scheduleId" uuid,
        ADD COLUMN IF NOT EXISTS "reply" character varying(1000),
        ADD COLUMN IF NOT EXISTS "repliedAt" TIMESTAMP
    `);

    const [existingKey] = await connection.query(
      `SELECT 1 FROM pg_constraint WHERE conname = $1`,
      [foreignKey],
    );

    if (!existingKey) {
      await connection.query(`
        ALTER TABLE "reviews" ADD CONSTRAINT "${foreignKey}"
        FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE SET NULL
      `);
    }

    await connection.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "${REVIEW_SCHEDULE_UNIQUE_INDEX}"
      ON "reviews" ("scheduleId") WHERE "scheduleId" IS NOT NULL
    `);

    console.log('✅ Avaliações ligadas a atendimento e com resposta da loja');
  } finally {
    await connection.close();
  }
}

void createReviewTrustColumns();
