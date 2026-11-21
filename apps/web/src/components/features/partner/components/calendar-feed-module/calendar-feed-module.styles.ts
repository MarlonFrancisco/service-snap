import { cn } from '@repo/ui';
import { PARTNER_FOCUS_CLASS } from '../../partner.styles';

export const CALENDAR_CARD_TEXT_CLASS =
  'mt-1 text-sm leading-[1.55] text-ink-muted';

export const CALENDAR_ACTIVE_BADGE_CLASS =
  'inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-xs font-bold text-success';

export const CALENDAR_ACTIVE_DOT_CLASS = 'size-[7px] rounded-full bg-success-vivid';

export const CALENDAR_LINK_FIELD_CLASS = cn(
  'min-h-11 min-w-0 flex-[1_1_320px] truncate rounded-full border border-line-strong bg-white px-4 text-[13px] font-medium text-ink-muted',
  PARTNER_FOCUS_CLASS,
);

export const CALENDAR_NOTE_CLASS =
  'rounded-[14px] bg-surface px-3.5 py-3 text-[13px] leading-[1.55] text-ink-soft';

export const CALENDAR_ROW_CLASS = 'flex flex-wrap items-center gap-2';

export const CALENDAR_MEMBER_SELECT_CLASS = cn(
  'cursor-pointer rounded-full border-line-strong bg-white px-4 text-[13px] font-semibold text-ink shadow-none data-[size=default]:h-11 *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate',
  PARTNER_FOCUS_CLASS,
);

export const CALENDAR_TAB_CLASS = cn(
  'min-h-10 cursor-pointer rounded-full border border-line-strong bg-white px-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface',
  PARTNER_FOCUS_CLASS,
);

export const CALENDAR_TAB_ACTIVE_CLASS =
  'border-ink bg-ink text-white hover:bg-ink';
