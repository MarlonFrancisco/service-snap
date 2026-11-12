import { CASH_SESSION_OPEN_INDEX } from '../modules/partner/stores/cash/cash-session.entity';
import { STORE_PAYMENT_PAID_AT_INDEX } from '../modules/partner/stores/cash/store-payment.entity';
import {
  CHECKOUT_CLOSED_AT_INDEX,
  CHECKOUT_ITEM_SCHEDULE_INDEX,
} from '../modules/partner/stores/checkout/checkout.entity';
import { COMMISSION_RULE_STORE_INDEX } from '../modules/partner/stores/commissions/commission-rule.entity';
import { LOYALTY_PROGRAM_STORE_INDEX } from '../modules/partner/stores/loyalty/loyalty-program.entity';
import { LOYALTY_REWARD_SEQUENCE_INDEX } from '../modules/partner/stores/loyalty/loyalty-reward.entity';
import { CUSTOMER_PACKAGE_CUSTOMER_INDEX } from '../modules/partner/stores/packages/customer-package.entity';
import {
  addForeignKey,
  baseColumns,
  runSchemaScript,
  type TSchemaDb,
} from './schema.helpers';

const MONEY = 'numeric(12,2)';

type TForeignKey = [string, string, 'CASCADE' | 'SET NULL'];

/** Cria a tabela e as chaves estrangeiras `[coluna, tabela, ao apagar]`. */
async function createTable(
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

/**
 * Gestão da loja (Fase 4): comissões, caixa, pagamentos, pacotes, fidelidade e
 * fechamento do atendimento. Sem argumento só confere; `--apply` cria tudo numa
 * transação. Pode rodar mais de uma vez.
 */
void runSchemaScript(
  'Gestão da loja pronta',
  [
    'commission_rules',
    'cash_sessions',
    'service_packages',
    'service_package_items',
    'customer_packages',
    'customer_package_items',
    'loyalty_programs',
    'loyalty_rewards',
    'checkouts',
    'checkout_items',
    'store_payments',
  ],
  async (db) => {
    await createTable(
      db,
      'commission_rules',
      `"type" character varying(10) NOT NULL,
       "value" ${MONEY} NOT NULL,
       "effectiveFrom" date NOT NULL,
       "createdById" uuid,
       "storeId" uuid NOT NULL,
       "storeMemberId" uuid,
       "serviceId" uuid`,
      [
        ['storeId', 'stores', 'CASCADE'],
        ['storeMemberId', 'store_members', 'CASCADE'],
        ['serviceId', 'services', 'CASCADE'],
      ],
    );
    await db.query(`CREATE INDEX IF NOT EXISTS "${COMMISSION_RULE_STORE_INDEX}"
      ON "commission_rules" ("storeId", "effectiveFrom")`);

    await createTable(
      db,
      'cash_sessions',
      `"openedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
       "openedById" uuid,
       "openingAmount" ${MONEY} NOT NULL DEFAULT '0',
       "closedAt" TIMESTAMP WITH TIME ZONE,
       "closedById" uuid,
       "countedCash" ${MONEY},
       "expectedCash" ${MONEY},
       "totals" jsonb,
       "notes" character varying(500),
       "storeId" uuid NOT NULL`,
      [['storeId', 'stores', 'CASCADE']],
    );
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS "${CASH_SESSION_OPEN_INDEX}"
      ON "cash_sessions" ("storeId") WHERE "closedAt" IS NULL`);

    await createTable(
      db,
      'service_packages',
      `"name" character varying(100) NOT NULL,
       "description" character varying(500),
       "price" ${MONEY} NOT NULL,
       "validityDays" integer,
       "isActive" boolean NOT NULL DEFAULT true,
       "storeId" uuid NOT NULL`,
      [['storeId', 'stores', 'CASCADE']],
    );

    await createTable(
      db,
      'service_package_items',
      `"quantity" integer NOT NULL,
       "packageId" uuid NOT NULL,
       "serviceId" uuid NOT NULL`,
      [
        ['packageId', 'service_packages', 'CASCADE'],
        ['serviceId', 'services', 'CASCADE'],
      ],
    );

    await createTable(
      db,
      'customer_packages',
      `"name" character varying(100) NOT NULL,
       "pricePaid" ${MONEY} NOT NULL,
       "purchasedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
       "expiresOn" date,
       "status" character varying(20) NOT NULL DEFAULT 'active',
       "cancelledAt" TIMESTAMP WITH TIME ZONE,
       "soldById" uuid,
       "notes" character varying(300),
       "storeId" uuid NOT NULL,
       "customerId" uuid NOT NULL,
       "packageId" uuid`,
      [
        ['storeId', 'stores', 'CASCADE'],
        ['customerId', 'users', 'CASCADE'],
        ['packageId', 'service_packages', 'SET NULL'],
      ],
    );
    await db.query(`CREATE INDEX IF NOT EXISTS "${CUSTOMER_PACKAGE_CUSTOMER_INDEX}"
      ON "customer_packages" ("storeId", "customerId")`);

    await createTable(
      db,
      'customer_package_items',
      `"serviceName" character varying(100) NOT NULL,
       "quantity" integer NOT NULL,
       "used" integer NOT NULL DEFAULT '0',
       "customerPackageId" uuid NOT NULL,
       "serviceId" uuid`,
      [
        ['customerPackageId', 'customer_packages', 'CASCADE'],
        ['serviceId', 'services', 'SET NULL'],
      ],
    );

    await createTable(
      db,
      'loyalty_programs',
      `"isActive" boolean NOT NULL DEFAULT true,
       "visitsRequired" integer NOT NULL,
       "rewardType" character varying(20) NOT NULL,
       "rewardValue" ${MONEY},
       "eligibleServiceIds" jsonb NOT NULL DEFAULT '[]',
       "rewardValidityDays" integer,
       "cycleStartsOn" date NOT NULL,
       "storeId" uuid NOT NULL,
       "rewardServiceId" uuid`,
      [
        ['storeId', 'stores', 'CASCADE'],
        ['rewardServiceId', 'services', 'SET NULL'],
      ],
    );
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS "${LOYALTY_PROGRAM_STORE_INDEX}"
      ON "loyalty_programs" ("storeId")`);

    await createTable(
      db,
      'loyalty_rewards',
      `"cycleStartsOn" date NOT NULL,
       "sequence" integer NOT NULL,
       "rewardType" character varying(20) NOT NULL,
       "rewardValue" ${MONEY},
       "description" character varying(160) NOT NULL,
       "earnedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
       "expiresOn" date,
       "status" character varying(20) NOT NULL DEFAULT 'available',
       "redeemedAt" TIMESTAMP WITH TIME ZONE,
       "redeemedById" uuid,
       "storeId" uuid NOT NULL,
       "customerId" uuid NOT NULL,
       "rewardServiceId" uuid`,
      [
        ['storeId', 'stores', 'CASCADE'],
        ['customerId', 'users', 'CASCADE'],
        ['rewardServiceId', 'services', 'SET NULL'],
      ],
    );
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS "${LOYALTY_REWARD_SEQUENCE_INDEX}"
      ON "loyalty_rewards" ("storeId", "customerId", "cycleStartsOn", "sequence")`);

    await createTable(
      db,
      'checkouts',
      `"closedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
       "closedById" uuid,
       "subtotal" ${MONEY} NOT NULL DEFAULT '0',
       "discount" ${MONEY} NOT NULL DEFAULT '0',
       "total" ${MONEY} NOT NULL DEFAULT '0',
       "received" ${MONEY} NOT NULL DEFAULT '0',
       "notes" character varying(500),
       "storeId" uuid NOT NULL,
       "customerId" uuid,
       "loyaltyRewardId" uuid`,
      [
        ['storeId', 'stores', 'CASCADE'],
        ['customerId', 'users', 'SET NULL'],
        ['loyaltyRewardId', 'loyalty_rewards', 'SET NULL'],
      ],
    );
    await db.query(`CREATE INDEX IF NOT EXISTS "${CHECKOUT_CLOSED_AT_INDEX}"
      ON "checkouts" ("storeId", "closedAt")`);

    await createTable(
      db,
      'checkout_items',
      `"price" ${MONEY} NOT NULL DEFAULT '0',
       "baseAmount" ${MONEY} NOT NULL DEFAULT '0',
       "checkoutId" uuid NOT NULL,
       "scheduleId" uuid NOT NULL,
       "customerPackageItemId" uuid`,
      [
        ['checkoutId', 'checkouts', 'CASCADE'],
        ['scheduleId', 'schedules', 'CASCADE'],
        ['customerPackageItemId', 'customer_package_items', 'SET NULL'],
      ],
    );
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS "${CHECKOUT_ITEM_SCHEDULE_INDEX}"
      ON "checkout_items" ("scheduleId")`);

    await createTable(
      db,
      'store_payments',
      `"method" character varying(20) NOT NULL,
       "amount" ${MONEY} NOT NULL,
       "paidAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
       "registeredById" uuid,
       "notes" character varying(300),
       "voidedAt" TIMESTAMP WITH TIME ZONE,
       "voidedById" uuid,
       "voidReason" character varying(300),
       "storeId" uuid NOT NULL,
       "cashSessionId" uuid,
       "checkoutId" uuid,
       "customerPackageId" uuid,
       "customerId" uuid`,
      [
        ['storeId', 'stores', 'CASCADE'],
        ['cashSessionId', 'cash_sessions', 'SET NULL'],
        ['checkoutId', 'checkouts', 'SET NULL'],
        ['customerPackageId', 'customer_packages', 'SET NULL'],
        ['customerId', 'users', 'SET NULL'],
      ],
    );
    await db.query(`CREATE INDEX IF NOT EXISTS "${STORE_PAYMENT_PAID_AT_INDEX}"
      ON "store_payments" ("storeId", "paidAt")`);
  },
);
