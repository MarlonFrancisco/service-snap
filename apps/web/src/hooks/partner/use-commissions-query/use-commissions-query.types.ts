import type { TCommissionReportQuery } from '@/types/api/commissions.types';

export type TUseCommissionRulesQueryConfig = {
  storeId?: string;
  enabled?: boolean;
};

export type TUseCommissionReportQueryConfig = TUseCommissionRulesQueryConfig & {
  query: TCommissionReportQuery;
  /** `me`: só a comissão de quem está logado (profissional). */
  scope: 'team' | 'me';
};
