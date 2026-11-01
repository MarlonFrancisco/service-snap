import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import type { CSSProperties } from 'react';

export const METRICS_PAGE_CLASS = 'grid min-w-0 gap-3.5 md:gap-5';

export const METRICS_KPI_GRID_CLASS =
  'grid grid-cols-2 gap-2.5 md:gap-3.5 lg:grid-cols-4';

export const METRICS_SECTION_GRID_CLASS =
  'grid grid-cols-1 gap-3.5 lg:grid-cols-2';

export const METRICS_CARD_CLASS =
  'min-w-0 rounded-[20px] border border-[#EBE9F0] bg-white p-4 md:rounded-[22px] md:p-[22px]';

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
  'bg-[#F7F6FA] text-[#5F5C6E]',
  'bg-[#EBE9F0] text-[#0B0B0F]',
  'bg-[#A6A3B4] text-[#0B0B0F]',
  'bg-[#0B0B0F] text-white',
] as const;

export const METRICS_CHART_COLORS = {
  ink: '#0B0B0F',
  muted: '#5F5C6E',
  area: '#F4F3F7',
  bar: '#D4D2DC',
  grid: '#F0EEF4',
} as const;

export const METRICS_RANK_COLORS = [
  '#0B0B0F',
  '#5F5C6E',
  '#A6A3B4',
  '#D4D2DC',
  '#EBE9F0',
] as const;

export const METRICS_TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #EBE9F0',
  borderRadius: 14,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 600,
  color: '#0B0B0F',
};

export const METRICS_AXIS_PROPS = {
  stroke: '#5F5C6E',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;
