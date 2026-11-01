import type { TPeriodFilterValue } from '../dashboard-module.types';

export const METRICS_AGENDA_HREF = '/partner/agenda';
export const METRICS_STORES_HREF = '/partner/stores';

export const PERIOD_OPTIONS: Array<{
  value: TPeriodFilterValue;
  label: string;
}> = [
  { value: 'week', label: 'Semanal' },
  { value: 'month', label: 'Mensal' },
  { value: 'quarter', label: 'Trimestral' },
];

export const PERIOD_COMPARISON_TEXT: Record<TPeriodFilterValue, string> = {
  week: 'vs semana passada',
  month: 'vs mês passado',
  quarter: 'vs trimestre passado',
};

export const PERIOD_CURRENT_TEXT: Record<TPeriodFilterValue, string> = {
  week: 'esta semana',
  month: 'este mês',
  quarter: 'este trimestre',
};

export const PERIOD_GOAL_TEXT: Record<TPeriodFilterValue, string> = {
  week: 'semanal',
  month: 'mensal',
  quarter: 'trimestral',
};

export const WEEK_FROM_MONDAY = [
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
  'Dom',
] as const;

export const WEEK_FROM_SUNDAY = [
  'Dom',
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
] as const;

/** `TO_CHAR(..., 'Mon')` no Postgres responde em inglês. */
export const MONTH_LABELS_PT: Record<string, string> = {
  Feb: 'Fev',
  Apr: 'Abr',
  May: 'Mai',
  Aug: 'Ago',
  Sep: 'Set',
  Oct: 'Out',
  Dec: 'Dez',
};

/** `monthlyGoal` é coluna `int` no Postgres. */
export const MAX_MONTHLY_GOAL = 2_147_483_647;
