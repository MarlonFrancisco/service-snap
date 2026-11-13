import type { TCancelScheduleSeries } from '@/types/api/schedule-series.types';

export type TUseScheduleSeriesMutationsConfig = {
  storeId: string;
};

export type TCancelScheduleSeriesVariables = TCancelScheduleSeries & {
  seriesId: string;
};
