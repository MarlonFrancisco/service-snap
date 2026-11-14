import type { RefObject } from 'react';
import type {
  TAuditActorOption,
  TAuditLogRow,
} from '../../audit-logs-module.types';

export type TAuditLogsFiltersConfig = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  area: string;
  onAreaChange: (value: string) => void;
  /** Sem opções, o filtro de pessoa não aparece (painel da plataforma). */
  actorOptions?: TAuditActorOption[];
  actor?: string;
  onActorChange?: (value: string) => void;
  rangeHint: string | null;
};

export type TAuditLogsTableConfig = {
  rows: TAuditLogRow[];
  selectedId: string | null;
  onSelectRow: (id: string) => void;
  isRefreshing: boolean;
};

export type TAuditLogDetailsConfig = {
  row: TAuditLogRow | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

export type TAuditLogsBoardConfig = {
  /** `h2` dentro do painel da loja (o casco tem o `h1`); `h1` no da plataforma. */
  headingLevel?: 'h1' | 'h2';
  title: string;
  lead: string;
  filters: TAuditLogsFiltersConfig;
  rows: TAuditLogRow[];
  selectedRow: TAuditLogRow | null;
  onSelectRow: (id: string) => void;
  detailsHeadingRef: RefObject<HTMLHeadingElement | null>;
  isLoading: boolean;
  isError: boolean;
  isRefreshing: boolean;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  rangeLabel: string;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};
