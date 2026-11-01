import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';

export const PROFILE_FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

export const PROFILE_SECTION_TITLE_CLASS =
  'text-xl font-extrabold tracking-[-0.02em] md:text-2xl md:tracking-[-0.025em]';

export const PROFILE_SECTION_LEAD_CLASS =
  'mt-0.5 mb-3.5 text-sm text-[#5F5C6E] md:mt-1 md:mb-[18px]';

export const PROFILE_ACTIONS_CLASS = 'mt-3 flex gap-2 md:mt-3.5 md:flex-wrap';

export const PROFILE_ACTION_CLASS = cn(
  'inline-flex h-[46px] min-w-0 flex-1 items-center justify-center rounded-full border border-[#E3E1EA] bg-white px-3 text-center text-[13px] leading-tight font-semibold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA] md:h-11 md:flex-none md:px-[18px]',
  PROFILE_FOCUS_CLASS,
);

export const PROFILE_ACTION_PRIMARY_CLASS = cn(
  PROFILE_ACTION_CLASS,
  'border-[#0B0B0F] bg-[#0B0B0F] font-bold text-white hover:bg-[#2B2B2B]',
);

export const PROFILE_CARDS_GRID_CLASS = 'grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6';

/** Modais abrem em portal, fora do `Header` que aplica a fonte. */
export const PROFILE_DIALOG_CLASS = cn(
  plusJakartaSans.className,
  'rounded-3xl text-[#0B0B0F]',
);

export const PROFILE_DIALOG_CONFIRM_CLASS =
  'h-11 rounded-full bg-[#0B0B0F] text-[13px] font-bold text-white hover:bg-[#2B2B2B]';

export const PROFILE_DIALOG_DISMISS_CLASS =
  'h-11 rounded-full border-[#E3E1EA] text-[13px] font-semibold text-[#0B0B0F]';
