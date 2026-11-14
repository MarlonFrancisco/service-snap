import type {
  TCreateScheduleSeries,
  TSeriesIntervalWeeks,
} from '@/types/api/schedule-series.types';

/** Situação de uma data da série antes de criar. */
export type TSeriesPreviewStatus =
  | 'free'
  | 'busy'
  | 'checking'
  | 'fit-in'
  | 'unknown'
  | 'no-time';

export type TSeriesPreviewItem = {
  date: string;
  /** "Seg, 16/11" */
  dayLabel: string;
  /** "16:00 às 16:30" */
  timeLabel: string;
  status: TSeriesPreviewStatus;
};

export type TSeriesIntervalOption = {
  value: TSeriesIntervalWeeks;
  label: string;
};

/** Data que ficou de fora, pronta para a tela. */
export type TSeriesResultConflict = {
  date: string;
  dayLabel: string;
  reasonLabel: string;
};

export type TSeriesResult = {
  seriesId: string;
  createdCount: number;
  totalCount: number;
  /** "Toda semana, segunda às 16:00, com Ana." */
  ruleLabel: string;
  conflicts: TSeriesResultConflict[];
};

/** O que o formulário manda; a regra (frequência, vezes) vem da seção Repetir. */
export type TSeriesSubmitPayload = Omit<
  TCreateScheduleSeries,
  'intervalWeeks' | 'occurrences'
>;
