import { cn } from '@repo/ui';
import { PARTNER_FOCUS_CLASS } from '../../partner.styles';

export const PUSH_BANNER_CLASS =
  'mb-4 flex flex-wrap items-center gap-3.5 rounded-[22px] bg-ink px-5 py-[18px] text-white';

export const PUSH_BANNER_ICON_CLASS =
  'grid size-11 shrink-0 place-items-center rounded-full bg-white/12';

export const PUSH_BANNER_PRIMARY_CLASS = cn(
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-[18px] text-[13px] font-bold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-70',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
);

export const PUSH_BANNER_GHOST_CLASS = cn(
  'min-h-11 cursor-pointer px-3.5 text-[13px] font-semibold text-white underline underline-offset-[3px]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
);

export const PUSH_CARD_CLASS =
  'mb-4 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[22px] border border-line px-5 py-4';

export const PUSH_CARD_TITLE_CLASS = 'block text-[15px] font-extrabold';

export const PUSH_CARD_TEXT_CLASS =
  'mt-0.5 text-sm leading-[1.55] text-ink-muted';

export const PUSH_ACTIVE_BADGE_CLASS =
  'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-xs font-bold text-success';

export const PUSH_ACTIVE_DOT_CLASS = 'size-[7px] rounded-full bg-success-vivid';

export const PUSH_HIDE_CLASS = cn(
  'min-h-11 cursor-pointer px-2 text-[13px] font-semibold text-ink-muted underline underline-offset-[3px] hover:text-ink',
  PARTNER_FOCUS_CLASS,
);
