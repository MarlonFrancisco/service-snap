import 'dotenv/config';
import { createConnection, type Connection } from 'typeorm';

/**
 * Base dos scripts de schema da Fase 4. Sem `--apply` só mostra o que existe;
 * com ele roda o SQL. Os nomes de chave saem do `namingStrategy`, os mesmos que
 * o TypeORM daria, para o `synchronize` não recriar nada depois.
 */
export async function runSchemaScript(
  title: string,
  tables: string[],
  apply: (connection: Connection) => Promise<void>,
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

    await connection.transaction(async (manager) =>
      apply(manager.connection),
    );
    console.log(`✅ ${title}`);
  } finally {
    await connection.close();
  }
}

/** `id`, `created_at` e `updated_at` do `BaseEntity`, com a chave primária. */
export const baseColumns = (connection: Connection, table: string) => `
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "${connection.namingStrategy.primaryKeyName(table, ['id'])}" PRIMARY KEY ("id")`;

/** Chave estrangeira com o nome do TypeORM, criada só se ainda não existir. */
export async function addForeignKey(
  connection: Connection,
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
  connection: Connection,
  table: string,
  columns: string[],
) => connection.namingStrategy.indexName(table, columns);

/** Restrição única com o nome do TypeORM, criada só se ainda não existir. */
export async function addUnique(
  connection: Connection,
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
