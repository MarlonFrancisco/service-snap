import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';

export const PARTNER_FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

export const PARTNER_SHELL_CLASS = cn(
  plusJakartaSans.className,
  'bg-white text-[#0B0B0F]',
);

/** Sheet, Popover e Dialog abrem em portal, fora do casco que aplica a fonte. */
export const PARTNER_PORTAL_CLASS = cn(
  plusJakartaSans.className,
  'text-[#0B0B0F]',
);

export const PARTNER_MUTED_TEXT_CLASS = 'text-[#5F5C6E]';

export const PARTNER_NAV_ICON_CLASS = 'size-[18px] shrink-0 stroke-[1.8]';

export const PARTNER_NAV_ITEM_CLASS = cn(
  'flex min-h-11 w-full items-center gap-2.5 rounded-[14px] px-3 text-left text-sm font-semibold transition-colors',
  PARTNER_FOCUS_CLASS,
);

export const PARTNER_NAV_ITEM_IDLE_CLASS =
  'text-[#5F5C6E] hover:bg-[#F7F6FA] hover:text-[#0B0B0F]';

export const PARTNER_NAV_ITEM_ACTIVE_CLASS = 'bg-[#0B0B0F] text-white';

export const PARTNER_NAV_SUB_ITEM_ACTIVE_CLASS = 'bg-[#F4F3F7] text-[#9810FA]';

export const PARTNER_ICON_BUTTON_CLASS = cn(
  'grid size-11 shrink-0 place-items-center rounded-full bg-[#F4F3F7] text-[#0B0B0F] transition-colors hover:bg-[#EBE9F0]',
  PARTNER_FOCUS_CLASS,
);

export const PARTNER_PRIMARY_ACTION_CLASS = cn(
  'flex min-h-11 items-center justify-center rounded-full bg-[#0B0B0F] px-4 text-center text-[13px] font-bold text-white transition-colors hover:bg-[#2B2B2B]',
  PARTNER_FOCUS_CLASS,
);

export const PARTNER_SOFT_SURFACE_CLASS = 'rounded-[22px] bg-[#F7F6FA]';

export const PARTNER_PAGE_TITLE_CLASS =
  'min-w-0 text-2xl font-extrabold tracking-[-0.03em] md:truncate md:text-xl md:tracking-[-0.02em]';
