import { SCHEDULE_SERIES_ITEM_SCHEDULE_INDEX } from '../modules/partner/stores/schedule-series/schedule-series.entity';
import { createTable, runSchemaScript } from './schema.helpers';

/** Agendamento recorrente: `schedule_series` e `schedule_series_items`. */
void runSchemaScript(
  'Agendamento recorrente pronto',
  ['schedule_series', 'schedule_series_items'],
  async (db) => {
    await createTable(
      db,
      'schedule_series',
      `"intervalWeeks" integer NOT NULL,
       "occurrences" integer NOT NULL,
       "startDate" date NOT NULL,
       "startTime" character(5) NOT NULL,
       "serviceIds" jsonb NOT NULL DEFAULT '[]',
       "createdById" uuid,
       "cancelledAt" TIMESTAMP WITH TIME ZONE,
       "storeId" uuid NOT NULL,
       "storeMemberId" uuid NOT NULL,
       "customerId" uuid`,
      [
        ['storeId', 'stores', 'CASCADE'],
        ['storeMemberId', 'store_members', 'CASCADE'],
        ['customerId', 'users', 'CASCADE'],
      ],
    );

    await createTable(
      db,
      'schedule_series_items',
      `"occurrence" integer NOT NULL,
       "seriesId" uuid NOT NULL,
       "scheduleId" uuid NOT NULL`,
      [
        ['seriesId', 'schedule_series', 'CASCADE'],
        ['scheduleId', 'schedules', 'CASCADE'],
      ],
    );
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS "${SCHEDULE_SERIES_ITEM_SCHEDULE_INDEX}"
      ON "schedule_series_items" ("scheduleId")`);
  },
);
