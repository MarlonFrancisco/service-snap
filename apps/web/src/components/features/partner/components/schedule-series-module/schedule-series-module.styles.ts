import type { TSeriesPreviewStatus } from './schedule-series-module.types';

export const SERIES_ITEM_CLASS =
  'flex items-center justify-between gap-3 rounded-[16px] border border-[#EBE9F0] px-4 py-3.5';

export const SERIES_ITEM_WARNING_CLASS =
  'flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#F3D4B8] bg-[#FFFAF5] px-4 py-3.5';

export const SERIES_CHIP_CLASS =
  'inline-flex items-center gap-1.5 rounded-full px-[11px] py-1 text-xs font-bold whitespace-nowrap';

export const SERIES_RADIO_CLASS =
  'flex min-h-11 cursor-pointer items-start gap-2.5 text-sm leading-[1.45]';

export const SERIES_RADIO_INPUT_CLASS =
  'mt-0.5 size-5 shrink-0 accent-[#9810FA]';

/** Chip e rótulo de cada situação da prévia. */
export const SERIES_PREVIEW_STATUS: Record<
  Exclude<TSeriesPreviewStatus, 'no-time'>,
  { label: string; className: string }
> = {
  free: { label: 'Livre', className: 'bg-[#DFF2E7] text-[#0A5536]' },
  busy: { label: 'Ocupado', className: 'bg-[#FBE8D9] text-[#7A3A07]' },
  checking: { label: 'Conferindo', className: 'bg-[#F4F3F7] text-[#3D3A4A]' },
  'fit-in': { label: 'Encaixe', className: 'bg-[#E4ECF6] text-[#143C66]' },
  unknown: { label: 'A conferir', className: 'bg-[#F4F3F7] text-[#3D3A4A]' },
};
