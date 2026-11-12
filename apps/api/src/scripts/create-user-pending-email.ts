import 'dotenv/config';
import { createConnection } from 'typeorm';

const COLUMNS = [
  ['pending_email', 'character varying'],
  ['pending_email_code', 'character(6)'],
  ['pending_email_expires_at', 'TIMESTAMP'],
] as const;

/**
 * Migração manual da troca de e-mail com código (colunas `pending_email*` em
 * `users`). Sem argumento só confere o banco; com `--apply` cria as colunas.
 * Pode rodar mais de uma vez.
 */
async function createUserPendingEmail() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const shouldApply = process.argv.includes('--apply');
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    const existing: { column_name: string }[] = await connection.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'users' AND column_name LIKE 'pending_email%'`,
    );
    const missing = COLUMNS.filter(
      ([name]) => !existing.some((row) => row.column_name === name),
    );

    console.log(
      `Colunas que faltam: ${missing.map(([name]) => name).join(', ') || 'nenhuma'}`,
    );

    if (!shouldApply) {
      console.log('Rode de novo com --apply para aplicar.');
      return;
    }

    for (const [name, type] of missing) {
      await connection.query(
        `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "${name}" ${type}`,
      );
    }

    console.log('✅ Troca de e-mail pronta');
  } finally {
    await connection.close();
  }
}

void createUserPendingEmail();
