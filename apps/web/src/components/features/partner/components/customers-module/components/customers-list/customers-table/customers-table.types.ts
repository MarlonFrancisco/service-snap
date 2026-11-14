import type { TCustomerContactLines } from '../../../customers-module.types';

/** Linha já formatada: a tabela só desenha. */
export type TCustomerRow = {
  id: string;
  name: string;
  href: string;
  contact: TCustomerContactLines;
  visits: number;
  lastVisit: string;
  isLastVisitEmpty: boolean;
  nextVisit: string;
  isNextVisitEmpty: boolean;
  totalSpent: string;
  tags: string[];
  /** Etiquetas que não couberam na linha ("+N"). */
  hiddenTags: number;
};

export type TCustomersTableConfig = {
  rows: TCustomerRow[];
  isRefreshing?: boolean;
};
