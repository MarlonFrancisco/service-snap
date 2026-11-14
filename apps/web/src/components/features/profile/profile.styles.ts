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

export const PROFILE_CARDS_GRID_CLASS =
  'grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6';

/** Modais abrem em portal, fora do `Header` que aplica a fonte. */
export const PROFILE_DIALOG_CLASS = cn(
  plusJakartaSans.className,
  'rounded-3xl text-[#0B0B0F]',
);

export const PROFILE_DIALOG_CONFIRM_CLASS =
  'h-11 rounded-full bg-[#0B0B0F] text-[13px] font-bold text-white hover:bg-[#2B2B2B]';

export const PROFILE_DIALOG_DISMISS_CLASS =
  'h-11 rounded-full border-[#E3E1EA] text-[13px] font-semibold text-[#0B0B0F]';

export const PROFILE_CARD_CLASS =
  'rounded-[22px] border border-[#E3E1EA] p-5 md:rounded-3xl md:p-6';

export const PROFILE_CARD_TITLE_CLASS = 'mb-3.5 text-[17px] font-bold';

export const PROFILE_FIELD_CLASS = 'grid gap-1.5 text-sm font-semibold';

export const PROFILE_INPUT_CLASS = cn(
  'h-[50px] rounded-[14px] border-[#E3E1EA] bg-white px-3.5 text-[15px] font-medium text-[#0B0B0F] shadow-none placeholder:text-[#6F6C7E] read-only:bg-[#F7F6FA] read-only:text-[#5F5C6E] md:text-[15px]',
  'focus-visible:border-[#0B0B0F] focus-visible:ring-[#0B0B0F]/20',
);

export const PROFILE_BUTTON_CLASS = cn(
  'inline-flex h-[50px] shrink-0 items-center justify-center gap-2 rounded-full border border-[#E3E1EA] bg-white px-[22px] text-sm font-bold whitespace-nowrap text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA] disabled:cursor-not-allowed disabled:opacity-50',
  PROFILE_FOCUS_CLASS,
);

export const PROFILE_BUTTON_PRIMARY_CLASS = cn(
  PROFILE_BUTTON_CLASS,
  'border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]',
);

export const PROFILE_TEXT_BUTTON_CLASS = cn(
  'inline-flex min-h-11 shrink-0 items-center px-1.5 text-sm font-bold text-[#0B0B0F] underline underline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  PROFILE_FOCUS_CLASS,
);

export const PROFILE_HINT_CLASS = 'text-[13px] text-[#5F5C6E]';

export const PROFILE_FIELD_ERROR_CLASS =
  'text-[13px] font-medium text-[#B42318]';

/** Botão de fechar do `DialogContent` no formato do desenho (redondo, 44px). */
export const PROFILE_DIALOG_CLOSE_CLASS =
  '[&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-[#F4F3F7] [&>button:last-child]:opacity-100';

export const PROFILE_DIALOG_BUTTON_CLASS = cn(
  'inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full border border-[#E3E1EA] bg-white px-4 text-sm font-bold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA] disabled:cursor-not-allowed disabled:opacity-50',
  PROFILE_FOCUS_CLASS,
);

export const PROFILE_DIALOG_BUTTON_PRIMARY_CLASS = cn(
  PROFILE_DIALOG_BUTTON_CLASS,
  'border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]',
);
