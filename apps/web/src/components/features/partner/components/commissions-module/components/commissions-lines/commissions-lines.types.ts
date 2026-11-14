import type { TCommissionLineRow } from '../../commissions-module.types';

export type TCommissionsLinesConfig = {
  rows: TCommissionLineRow[];
  label: string;
  isRefreshing?: boolean;
};
