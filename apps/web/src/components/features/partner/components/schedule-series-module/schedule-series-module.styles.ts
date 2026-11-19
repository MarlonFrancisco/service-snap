import type { TSeriesPreviewStatus } from './schedule-series-module.types';

export const SERIES_ITEM_CLASS =
  'flex items-center justify-between gap-3 rounded-[16px] border border-line px-4 py-3.5';

export const SERIES_ITEM_WARNING_CLASS =
  'flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-warning-line bg-warning-bg-soft px-4 py-3.5';

export const SERIES_CHIP_CLASS =
  'inline-flex items-center gap-1.5 rounded-full px-[11px] py-1 text-xs font-bold whitespace-nowrap';

export const SERIES_RADIO_CLASS =
  'flex min-h-11 cursor-pointer items-start gap-2.5 text-sm leading-[1.45]';

export const SERIES_RADIO_INPUT_CLASS =
  'mt-0.5 size-5 shrink-0 accent-brand';

/** Chip e rótulo de cada situação da prévia. */
export const SERIES_PREVIEW_STATUS: Record<
  Exclude<TSeriesPreviewStatus, 'no-time'>,
  { label: string; className: string }
> = {
  free: { label: 'Livre', className: 'bg-success-bg text-success' },
  busy: { label: 'Ocupado', className: 'bg-warning-bg text-warning' },
  checking: { label: 'Conferindo', className: 'bg-surface-2 text-ink-soft' },
  'fit-in': { label: 'Encaixe', className: 'bg-info-bg text-info' },
  unknown: { label: 'A conferir', className: 'bg-surface-2 text-ink-soft' },
};
