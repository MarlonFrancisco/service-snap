import 'dotenv/config';
import { createConnection, type Connection } from 'typeorm';

/** O que os scripts usam: `query` corre dentro da transação do `--apply`. */
export type TSchemaDb = Pick<Connection, 'namingStrategy' | 'query'>;

/**
 * Base dos scripts de schema da Fase 4. Sem `--apply` só mostra o que existe;
 * com ele roda o SQL. Os nomes de chave saem do `namingStrategy`, os mesmos que
 * o TypeORM daria, para o `synchronize` não recriar nada depois.
 */
export async function runSchemaScript(
  title: string,
  tables: string[],
  apply: (db: TSchemaDb) => Promise<void>,
) {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const shouldApply = process.argv.includes('--apply');
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    for (const table of tables) {
      const [{ name }] = await connection.query(
        `SELECT to_regclass($1) AS "name"`,
        [`public.${table}`],
      );
      console.log(`Tabela ${table}: ${name ? 'existe' : 'não existe'}`);
    }

    if (!shouldApply) {
      console.log('Rode de novo com --apply para aplicar.');
      return;
    }

    // Tudo ou nada: uma falha no meio não deixa metade do schema aplicado
    await connection.transaction((manager) =>
      apply({
        namingStrategy: connection.namingStrategy,
        query: (sql: string, parameters?: unknown[]) =>
          manager.query(sql, parameters),
      }),
    );
    console.log(`✅ ${title}`);
  } finally {
    await connection.close();
  }
}

/** `id`, `created_at` e `updated_at` do `BaseEntity`, com a chave primária. */
export const baseColumns = (connection: TSchemaDb, table: string) => `
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "${connection.namingStrategy.primaryKeyName(table, ['id'])}" PRIMARY KEY ("id")`;

/** Chave estrangeira com o nome do TypeORM, criada só se ainda não existir. */
export async function addForeignKey(
  connection: TSchemaDb,
  table: string,
  column: string,
  referenced: string,
  onDelete: 'CASCADE' | 'SET NULL',
) {
  const name = connection.namingStrategy.foreignKeyName(
    table,
    [column],
    referenced,
    ['id'],
  );
  const [existing] = await connection.query(
    `SELECT 1 FROM pg_constraint WHERE conname = $1`,
    [name],
  );

  if (existing) return;

  await connection.query(`
    ALTER TABLE "${table}" ADD CONSTRAINT "${name}"
    FOREIGN KEY ("${column}") REFERENCES "${referenced}"("id")
    ON DELETE ${onDelete} ON UPDATE NO ACTION
  `);
}

/** Índice com o nome do TypeORM quando a entidade não dá um nome próprio. */
export const indexName = (
  connection: TSchemaDb,
  table: string,
  columns: string[],
) => connection.namingStrategy.indexName(table, columns);

/** Restrição única com o nome do TypeORM, criada só se ainda não existir. */
export async function addUnique(
  connection: TSchemaDb,
  table: string,
  columns: string[],
  name = connection.namingStrategy.uniqueConstraintName(table, columns),
) {
  const [existing] = await connection.query(
    `SELECT 1 FROM pg_constraint WHERE conname = $1`,
    [name],
  );

  if (existing) return;

  await connection.query(
    `ALTER TABLE "${table}" ADD CONSTRAINT "${name}" UNIQUE (${columns
      .map((column) => `"${column}"`)
      .join(', ')})`,
  );
}

/** Coluna de dinheiro (`numeric(12,2)`), igual à das entidades. */
export const MONEY = 'numeric(12,2)';

export type TForeignKey = [string, string, 'CASCADE' | 'SET NULL'];

/** Cria a tabela e as chaves estrangeiras `[coluna, tabela, ao apagar]`. */
export async function createTable(
  db: TSchemaDb,
  table: string,
  columns: string,
  foreignKeys: TForeignKey[],
) {
  await db.query(
    `CREATE TABLE IF NOT EXISTS "${table}" (${baseColumns(db, table)}, ${columns})`,
  );

  for (const [column, referenced, onDelete] of foreignKeys) {
    await addForeignKey(db, table, column, referenced, onDelete);
  }
}
