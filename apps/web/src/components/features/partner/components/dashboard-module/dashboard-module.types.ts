import type { ReactNode } from 'react';

export type TPeriodFilterValue = 'week' | 'month' | 'quarter';

export type TMetricsView = 'loading' | 'no-store' | 'error' | 'empty' | 'ready';

export type TMetricsHeading = 'h2' | 'h3';

export type TResolveMetricsViewConfig = {
  isStoreLoading: boolean;
  hasStoreError: boolean;
  hasNoStore: boolean;
  isPending: boolean;
  isError: boolean;
  hasData: boolean;
  hasActivity: boolean;
};

export type TUseMetricsViewConfig = {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  hasData: boolean;
  hasActivity: boolean;
  refetch: () => unknown;
};

export type TMetricCardConfig = {
  label: string;
  value: string;
  detail?: string;
  /** Complemento do `detail`; o design omite no celular. */
  comparison?: string;
};

export type TMetricsSectionConfig = {
  title: string;
  subtitle?: string;
  headingAs?: TMetricsHeading;
  className?: string;
  children: ReactNode;
};

export type TMetricsRowConfig = {
  label: ReactNode;
  sublabel?: string;
  value: ReactNode;
};

export type TMetricsChartTableConfig = {
  caption: string;
  headers: string[];
  rows: Array<Array<string | number>>;
};

export type TMetricsStateConfig = {
  view: TMetricsView;
  empty: ReactNode;
  onRetry: () => void;
  titleAs?: TMetricsHeading;
};

export type TPeriodFilterConfig = {
  value: TPeriodFilterValue;
  onValueChange: (value: TPeriodFilterValue) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export type TMetricsPageHeaderConfig = {
  title: string;
  summary?: string;
  children: ReactNode;
};
