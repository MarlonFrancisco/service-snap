import 'dotenv/config';
import { createConnection } from 'typeorm';
import { toE164 } from '../utils/helpers/region.helpers';

/**
 * Migração manual da fase 1 do multirregional (`synchronize: false` em produção).
 * Pode rodar mais de uma vez.
 *
 * 1. Snapshot de preço e moeda em `schedules`, preenchido com o preço atual do
 *    serviço e a moeda da loja (o mesmo valor que o dashboard já usava).
 * 2. Telefones de lojas e usuários em E.164, lidos no país de cada um.
 *    Usuário cujo número normalizado já pertence a outro cadastro fica como está
 *    e entra no relatório: unir contas é decisão manual.
 *
 * `--dry-run` só mostra o que mudaria.
 */
const DRY_RUN = process.argv.includes('--dry-run');

type TPhoneRow = { id: string; telephone: string; country: string | null };

async function migrateMultiregionalFoundation() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Check apps/api/.env');
  }

  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
  });

  try {
    await connection.transaction(async (manager) => {
      await manager.query(`
        ALTER TABLE "schedules"
          ADD COLUMN IF NOT EXISTS "price" numeric(12,2),
          ADD COLUMN IF NOT EXISTS "currency" character(3)
      `);

      const [, backfilled] = await manager.query(`
        UPDATE "schedules" sch
        SET "price" = COALESCE(sch."price", s."price"),
            "currency" = COALESCE(sch."currency", st."currency", 'BRL')
        FROM "services" s, "stores" st
        WHERE s."id" = sch."serviceId"
          AND st."id" = sch."storeId"
          AND (sch."price" IS NULL OR sch."currency" IS NULL)
      `);
      console.log(`✅ schedules: snapshot de preço em ${backfilled} linha(s)`);

      const stores: TPhoneRow[] = await manager.query(`
        SELECT "id", "telephone", "country" FROM "stores"
        WHERE "telephone" IS NOT NULL
      `);
      let storesUpdated = 0;
      const storesSkipped: TPhoneRow[] = [];

      for (const store of stores) {
        const phone = toE164(store.telephone, store.country);
        if (!phone) {
          storesSkipped.push(store);
          continue;
        }
        if (phone === store.telephone) continue;
        if (!DRY_RUN) {
          await manager.query(
            `UPDATE "stores" SET "telephone" = $1 WHERE "id" = $2`,
            [phone, store.id],
          );
        }
        storesUpdated++;
      }
      console.log(
        `✅ stores: ${storesUpdated} telefone(s) em E.164, ${storesSkipped.length} inválido(s)`,
      );

      // Telefone de usuário é único: o E.164 é comparado com os já gravados
      const users: TPhoneRow[] = await manager.query(`
        SELECT "id", "telephone", "country" FROM "users"
        WHERE "telephone" IS NOT NULL
      `);
      let usersUpdated = 0;
      const usersConflicts: string[] = [];
      const usersInvalid: string[] = [];

      for (const user of users) {
        const phone = toE164(user.telephone, user.country);

        if (!phone) {
          usersInvalid.push(user.id);
          continue;
        }
        if (phone === user.telephone) continue;

        const [owner] = await manager.query(
          `SELECT "id" FROM "users" WHERE "telephone" = $1 AND "id" <> $2 LIMIT 1`,
          [phone, user.id],
        );
        if (owner) {
          usersConflicts.push(`${user.id} ↔ ${owner.id}`);
          continue;
        }
        if (!DRY_RUN) {
          await manager.query(
            `UPDATE "users" SET "telephone" = $1 WHERE "id" = $2`,
            [phone, user.id],
          );
        }
        usersUpdated++;
      }
      console.log(
        `✅ users: ${usersUpdated} telefone(s) em E.164, ${usersInvalid.length} inválido(s), ${usersConflicts.length} conflito(s)`,
      );
      usersConflicts.forEach((pair) => console.log(`   conflito: ${pair}`));

      if (DRY_RUN) {
        throw new DryRunRollback();
      }
    });
  } catch (error) {
    if (!(error instanceof DryRunRollback)) throw error;
    console.log('ℹ️  --dry-run: nada foi gravado');
  } finally {
    await connection.close();
  }
}

class DryRunRollback extends Error {}

void migrateMultiregionalFoundation();
