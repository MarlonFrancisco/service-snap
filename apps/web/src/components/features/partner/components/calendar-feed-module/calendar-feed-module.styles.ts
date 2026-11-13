import { cn } from '@repo/ui';
import { PARTNER_FOCUS_CLASS } from '../../partner.styles';

export const CALENDAR_CARD_TEXT_CLASS =
  'mt-1 text-sm leading-[1.55] text-[#5F5C6E]';

export const CALENDAR_ACTIVE_BADGE_CLASS =
  'inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EE] px-2.5 py-1 text-xs font-bold text-[#0A6B44]';

export const CALENDAR_ACTIVE_DOT_CLASS = 'size-[7px] rounded-full bg-[#0A7D4F]';

export const CALENDAR_LINK_FIELD_CLASS = cn(
  'min-h-11 min-w-0 flex-[1_1_320px] truncate rounded-full border border-[#E3E1EA] bg-white px-4 text-[13px] font-medium text-[#5F5C6E]',
  PARTNER_FOCUS_CLASS,
);

export const CALENDAR_NOTE_CLASS =
  'rounded-[14px] bg-[#F7F6FA] px-3.5 py-3 text-[13px] leading-[1.55] text-[#3F3C4C]';

export const CALENDAR_ROW_CLASS = 'flex flex-wrap items-center gap-2';

export const CALENDAR_MEMBER_SELECT_CLASS = cn(
  'cursor-pointer rounded-full border-[#E3E1EA] bg-white px-4 text-[13px] font-semibold text-[#0B0B0F] shadow-none data-[size=default]:h-11 *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate',
  PARTNER_FOCUS_CLASS,
);

export const CALENDAR_TAB_CLASS = cn(
  'min-h-10 cursor-pointer rounded-full border border-[#E3E1EA] bg-white px-3.5 text-[13px] font-semibold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA]',
  PARTNER_FOCUS_CLASS,
);

export const CALENDAR_TAB_ACTIVE_CLASS =
  'border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#0B0B0F]';
