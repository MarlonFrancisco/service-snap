import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';

export const PARTNER_FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

export const PARTNER_SHELL_CLASS = cn(
  plusJakartaSans.className,
  'bg-white text-ink',
);

/** Sheet, Popover e Dialog abrem em portal, fora do casco que aplica a fonte. */
export const PARTNER_PORTAL_CLASS = cn(
  plusJakartaSans.className,
  'text-ink',
);

export const PARTNER_MUTED_TEXT_CLASS = 'text-ink-muted';

export const PARTNER_NAV_ICON_CLASS = 'size-[18px] shrink-0 stroke-[1.8]';

export const PARTNER_NAV_ITEM_CLASS = cn(
  'flex min-h-11 w-full items-center gap-2.5 rounded-[14px] px-3 text-left text-sm font-semibold transition-colors',
  PARTNER_FOCUS_CLASS,
);

export const PARTNER_NAV_ITEM_IDLE_CLASS =
  'text-ink-muted hover:bg-surface hover:text-ink';

export const PARTNER_NAV_ITEM_ACTIVE_CLASS = 'bg-ink text-white';

export const PARTNER_NAV_SUB_ITEM_ACTIVE_CLASS = 'bg-surface-2 text-brand';

export const PARTNER_ICON_BUTTON_CLASS = cn(
  'grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 text-ink transition-colors hover:bg-line',
  PARTNER_FOCUS_CLASS,
);

export const PARTNER_PRIMARY_ACTION_CLASS = cn(
  'flex min-h-11 items-center justify-center rounded-full bg-ink px-4 text-center text-[13px] font-bold text-white transition-colors hover:bg-ink-hover',
  PARTNER_FOCUS_CLASS,
);

export const PARTNER_SOFT_SURFACE_CLASS = 'rounded-[22px] bg-surface';

export const PARTNER_PAGE_TITLE_CLASS =
  'min-w-0 text-2xl font-extrabold tracking-[-0.03em] md:truncate md:text-xl md:tracking-[-0.02em]';
