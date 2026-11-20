import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';

export const PROFILE_FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

export const PROFILE_SECTION_TITLE_CLASS =
  'text-xl font-extrabold tracking-[-0.02em] md:text-2xl md:tracking-[-0.025em]';

export const PROFILE_SECTION_LEAD_CLASS =
  'mt-0.5 mb-3.5 text-sm text-ink-muted md:mt-1 md:mb-[18px]';

export const PROFILE_ACTIONS_CLASS = 'mt-3 flex gap-2 md:mt-3.5 md:flex-wrap';

export const PROFILE_ACTION_CLASS = cn(
  'inline-flex h-[46px] min-w-0 flex-1 items-center justify-center rounded-full border border-line-strong bg-white px-3 text-center text-[13px] leading-tight font-semibold text-ink transition-colors hover:bg-surface md:h-11 md:flex-none md:px-[18px]',
  PROFILE_FOCUS_CLASS,
);

export const PROFILE_ACTION_PRIMARY_CLASS = cn(
  PROFILE_ACTION_CLASS,
  'border-ink bg-ink font-bold text-white hover:bg-ink-hover',
);

export const PROFILE_CARDS_GRID_CLASS =
  'grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6';

/** Modais abrem em portal, fora do `Header` que aplica a fonte. */
export const PROFILE_DIALOG_CLASS = cn(
  plusJakartaSans.className,
  'rounded-3xl text-ink',
);

export const PROFILE_DIALOG_CONFIRM_CLASS =
  'h-11 rounded-full bg-ink text-[13px] font-bold text-white hover:bg-ink-hover';

export const PROFILE_DIALOG_DISMISS_CLASS =
  'h-11 rounded-full border-line-strong text-[13px] font-semibold text-ink';

export const PROFILE_CARD_CLASS =
  'rounded-[22px] border border-line-strong p-5 md:rounded-3xl md:p-6';

export const PROFILE_CARD_TITLE_CLASS = 'mb-3.5 text-[17px] font-bold';

export const PROFILE_FIELD_CLASS = 'grid gap-1.5 text-sm font-semibold';

export const PROFILE_INPUT_CLASS = cn(
  'h-[50px] rounded-[14px] border-line-strong bg-white px-3.5 text-[15px] font-medium text-ink shadow-none placeholder:text-ink-muted read-only:bg-surface read-only:text-ink-muted md:text-[15px]',
  'focus-visible:border-ink focus-visible:ring-ink/20',
);

export const PROFILE_BUTTON_CLASS = cn(
  'inline-flex h-[50px] shrink-0 items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-[22px] text-sm font-bold whitespace-nowrap text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50',
  PROFILE_FOCUS_CLASS,
);

export const PROFILE_BUTTON_PRIMARY_CLASS = cn(
  PROFILE_BUTTON_CLASS,
  'border-ink bg-ink text-white hover:bg-ink-hover',
);

export const PROFILE_TEXT_BUTTON_CLASS = cn(
  'inline-flex min-h-11 shrink-0 items-center px-1.5 text-sm font-bold text-ink underline underline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  PROFILE_FOCUS_CLASS,
);

export const PROFILE_HINT_CLASS = 'text-[13px] text-ink-muted';

export const PROFILE_FIELD_ERROR_CLASS =
  'text-[13px] font-medium text-error';

/** Botão de fechar do `DialogContent` no formato do desenho (redondo, 44px). */
export const PROFILE_DIALOG_CLOSE_CLASS =
  '[&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-surface-2 [&>button:last-child]:opacity-100';

export const PROFILE_DIALOG_BUTTON_CLASS = cn(
  'inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-4 text-sm font-bold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50',
  PROFILE_FOCUS_CLASS,
);

export const PROFILE_DIALOG_BUTTON_PRIMARY_CLASS = cn(
  PROFILE_DIALOG_BUTTON_CLASS,
  'border-ink bg-ink text-white hover:bg-ink-hover',
);
