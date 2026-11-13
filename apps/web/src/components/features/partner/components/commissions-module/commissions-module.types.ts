import type { TCommissionReportQuery } from '@/types/api/commissions.types';
import type { MANAGEMENT_CHIP_TONE } from '../cash-module/cash-module.styles';

export type TChipTone = keyof typeof MANAGEMENT_CHIP_TONE;

export type TCommissionsPeriod = TCommissionReportQuery;

/** Atalhos do período: mês atual, anterior ou datas escolhidas à mão. */
export type TCommissionsPeriodShortcut = 'this-month' | 'last-month' | 'custom';

export type TCommissionsPeriodState = {
  period: TCommissionsPeriod;
  shortcut: TCommissionsPeriodShortcut;
  periodError: string | null;
  handleFromChange: (value: string) => void;
  handleToChange: (value: string) => void;
  handleShortcut: (
    shortcut: Exclude<TCommissionsPeriodShortcut, 'custom'>,
  ) => void;
};

export type TCommissionLineRow = {
  id: string;
  day: string;
  serviceName: string;
  customerName: string;
  professionalName: string;
  base: string;
  source: { label: string; tone: TChipTone };
  rule: string;
  commission: string;
};

export type TCommissionKpi = {
  label: string;
  value: string;
};

export type TCommissionRuleStatus = 'current' | 'future' | 'previous';

export type TCommissionRuleItem = {
  id: string;
  title: string;
  description: string;
  status: TCommissionRuleStatus;
};

export type TCommissionRuleGroups = {
  active: TCommissionRuleItem[];
  previous: TCommissionRuleItem[];
};
