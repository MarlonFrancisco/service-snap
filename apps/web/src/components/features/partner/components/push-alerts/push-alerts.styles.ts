import { cn } from '@repo/ui';
import { PARTNER_FOCUS_CLASS } from '../../partner.styles';

export const PUSH_BANNER_CLASS =
  'mb-4 flex flex-wrap items-center gap-3.5 rounded-[22px] bg-[#0B0B0F] px-5 py-[18px] text-white';

export const PUSH_BANNER_ICON_CLASS =
  'grid size-11 shrink-0 place-items-center rounded-full bg-white/12';

export const PUSH_BANNER_PRIMARY_CLASS = cn(
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-[18px] text-[13px] font-bold text-[#0B0B0F] transition-colors hover:bg-[#F4F3F7] disabled:cursor-not-allowed disabled:opacity-70',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
);

export const PUSH_BANNER_GHOST_CLASS = cn(
  'min-h-11 cursor-pointer px-3.5 text-[13px] font-semibold text-white underline underline-offset-[3px]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
);

export const PUSH_CARD_CLASS =
  'mb-4 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[22px] border border-[#EBE9F0] px-5 py-4';

export const PUSH_CARD_TITLE_CLASS = 'block text-[15px] font-extrabold';

export const PUSH_CARD_TEXT_CLASS =
  'mt-0.5 text-sm leading-[1.55] text-[#5F5C6E]';

export const PUSH_ACTIVE_BADGE_CLASS =
  'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E8F5EE] px-2.5 py-1 text-xs font-bold text-[#0A6B44]';

export const PUSH_ACTIVE_DOT_CLASS = 'size-[7px] rounded-full bg-[#0A7D4F]';

export const PUSH_HIDE_CLASS = cn(
  'min-h-11 cursor-pointer px-2 text-[13px] font-semibold text-[#5F5C6E] underline underline-offset-[3px] hover:text-[#0B0B0F]',
  PARTNER_FOCUS_CLASS,
);
