import type { TCommissionKpi } from '../../commissions-module.types';

export type TCommissionsKpisConfig = {
  kpis: TCommissionKpi[];
  isLoading?: boolean;
};
