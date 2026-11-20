import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import type { CSSProperties } from 'react';

export const METRICS_PAGE_CLASS = 'grid min-w-0 gap-3.5 md:gap-5';

export const METRICS_KPI_GRID_CLASS =
  'grid grid-cols-2 gap-2.5 md:gap-3.5 lg:grid-cols-4';

export const METRICS_SECTION_GRID_CLASS =
  'grid grid-cols-1 gap-3.5 lg:grid-cols-2';

export const METRICS_CARD_CLASS =
  'min-w-0 rounded-[20px] border border-line bg-white p-4 md:rounded-[22px] md:p-[22px]';

export const METRICS_SECTION_SUBTITLE_CLASS = cn(
  'mt-0.5 mb-3.5 text-[13px]',
  PARTNER_MUTED_TEXT_CLASS,
);

export const METRICS_CHART_LABEL_CLASS = cn(
  'text-[13px] font-semibold',
  PARTNER_MUTED_TEXT_CLASS,
);

export const METRICS_LEGEND_CLASS = cn(
  'mt-2.5 flex flex-wrap gap-3.5 text-[13px]',
  PARTNER_MUTED_TEXT_CLASS,
);

export const METRICS_HEAT_LEVEL_CLASSES = [
  'bg-surface text-ink-muted',
  'bg-line text-ink',
  'bg-ink-faint text-ink',
  'bg-ink text-white',
] as const;

export const METRICS_CHART_COLORS = {
  ink: 'var(--ss-ink)',
  muted: 'var(--ss-ink-muted)',
  area: 'var(--ss-surface-2)',
  bar: 'var(--ss-line-2)',
  grid: 'var(--ss-surface-3)',
} as const;

export const METRICS_RANK_COLORS = [
  'var(--ss-ink)',
  'var(--ss-ink-muted)',
  'var(--ss-ink-faint)',
  'var(--ss-line-2)',
  'var(--ss-line)',
] as const;

export const METRICS_TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: 'var(--ss-white)',
  border: '1px solid var(--ss-line)',
  borderRadius: 14,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--ss-ink)',
};

export const METRICS_AXIS_PROPS = {
  stroke: 'var(--ss-ink-muted)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;
