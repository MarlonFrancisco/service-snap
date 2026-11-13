import 'dotenv/config';
import { createConnection } from 'typeorm';
import { STORE_SLUG_UNIQUE } from '../modules/partner/stores/store.entity';
import { buildSlugCandidates } from '../modules/partner/stores/stores.helpers';

/**
 * Migração manual do link curto das lojas (`stores.slug`). Sem argumento só
 * confere o banco; com `--apply` cria a coluna e o índice único e dá slug a
 * cada loja com nome que ainda não tem um. Pode rodar mais de uma vez.
 */
async function createStoreSlugs() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const shouldApply = process.argv.includes('--apply');
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    const [column] = await connection.query(
      `SELECT 1 AS "exists" FROM information_schema.columns
       WHERE table_name = 'stores' AND column_name = 'slug'`,
    );
    const pending: { id: string; name: string; city: string | null }[] =
      await connection.query(
        `SELECT "id", "name", "city" FROM "stores"
         WHERE "name" IS NOT NULL ${column ? 'AND "slug" IS NULL' : ''}
         ORDER BY "created_at"`,
      );

    console.log(`Coluna stores.slug: ${column ? 'existe' : 'não existe'}`);
    console.log(`Lojas sem slug: ${pending.length}`);

    if (!shouldApply) {
      console.log('Rode de novo com --apply para aplicar.');
      return;
    }

    await connection.query(
      `ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "slug" character varying(80)`,
    );
    await connection.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "${STORE_SLUG_UNIQUE}" ON "stores" ("slug")`,
    );

    const taken = new Set<string>(
      (
        await connection.query(
          `SELECT "slug" FROM "stores" WHERE "slug" IS NOT NULL`,
        )
      ).map(({ slug }: { slug: string }) => slug),
    );
    const skipped: string[] = [];

    // A mais antiga fica com o slug mais curto
    for (const store of pending) {
      const slug = buildSlugCandidates(store.name, store.city).find(
        (candidate) => !taken.has(candidate),
      );

      if (!slug) {
        skipped.push(store.id);
        continue;
      }

      await connection.query(`UPDATE "stores" SET "slug" = $1 WHERE "id" = $2`, [
        slug,
        store.id,
      ]);
      taken.add(slug);
    }

    console.log(
      `✅ Slugs prontos (${pending.length - skipped.length} lojas)` +
        (skipped.length ? `; sem slug possível: ${skipped.join(', ')}` : ''),
    );
  } finally {
    await connection.close();
  }
}

void createStoreSlugs();
