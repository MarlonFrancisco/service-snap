import type { IDashboardSales } from '@/types/api/metrics.types';
import type { TPeriodFilterValue } from '../dashboard-module.types';
import type { createMoneyFormatters } from '../utils/metrics.helpers';

export type TSalesGoalCardConfig = {
  storeId: string;
  period: TPeriodFilterValue;
  goal: IDashboardSales['goal'];
  money: ReturnType<typeof createMoneyFormatters>;
  onSelectMonthly: () => void;
};

export type TUseSalesGoalCardConfig = Pick<
  TSalesGoalCardConfig,
  'storeId' | 'period' | 'goal'
>;
