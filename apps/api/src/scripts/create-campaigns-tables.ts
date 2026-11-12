import {
  CAMPAIGN_RECIPIENT_UNIQUE_INDEX,
  MARKETING_OPT_OUT_UNIQUE_INDEX,
} from '../modules/partner/stores/campaigns/campaign.entity';
import { createTable, runSchemaScript } from './schema.helpers';

/** Campanhas de reativação: `campaigns`, destinatários e quem saiu da lista. */
void runSchemaScript(
  'Campanhas de reativação prontas',
  ['campaigns', 'campaign_recipients', 'marketing_opt_outs'],
  async (db) => {
    await createTable(
      db,
      'campaigns',
      `"name" character varying(100) NOT NULL,
       "channel" character varying(20) NOT NULL,
       "inactiveDays" integer NOT NULL,
       "template" jsonb NOT NULL,
       "status" character varying(20) NOT NULL DEFAULT 'queued',
       "recipientsCount" integer NOT NULL DEFAULT '0',
       "createdById" uuid,
       "storeId" uuid NOT NULL`,
      [['storeId', 'stores', 'CASCADE']],
    );

    await createTable(
      db,
      'campaign_recipients',
      `"status" character varying(20) NOT NULL DEFAULT 'queued',
       "attempts" integer NOT NULL DEFAULT '0',
       "error" character varying(300),
       "sentAt" TIMESTAMP WITH TIME ZONE,
       "campaignId" uuid NOT NULL,
       "customerId" uuid NOT NULL`,
      [
        ['campaignId', 'campaigns', 'CASCADE'],
        ['customerId', 'users', 'CASCADE'],
      ],
    );
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS "${CAMPAIGN_RECIPIENT_UNIQUE_INDEX}"
      ON "campaign_recipients" ("campaignId", "customerId")`);

    await createTable(
      db,
      'marketing_opt_outs',
      `"source" character varying(20) NOT NULL,
       "storeId" uuid NOT NULL,
       "customerId" uuid NOT NULL`,
      [
        ['storeId', 'stores', 'CASCADE'],
        ['customerId', 'users', 'CASCADE'],
      ],
    );
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS "${MARKETING_OPT_OUT_UNIQUE_INDEX}"
      ON "marketing_opt_outs" ("storeId", "customerId")`);
  },
);
