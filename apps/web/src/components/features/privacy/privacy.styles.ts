import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

export const PRIVACY_CARD_CLASS =
  'grid gap-4 rounded-[22px] border border-[#E3E1EA] p-5 md:rounded-3xl md:p-6';

export const PRIVACY_CARD_TITLE_CLASS =
  'text-xl font-extrabold tracking-[-0.02em] text-[#0B0B0F]';

export const PRIVACY_ITEM_CLASS =
  'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EBE9F0] px-4 py-3.5';

export const PRIVACY_TEXT_CLASS = 'text-sm leading-normal text-[#5F5C6E]';

export const PRIVACY_BUTTON_CLASS = cn(
  'inline-flex min-h-[46px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#E3E1EA] bg-white px-[18px] text-sm font-bold whitespace-nowrap text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA] disabled:cursor-not-allowed disabled:opacity-60',
  FOCUS_CLASS,
);

export const PRIVACY_DANGER_BUTTON_CLASS = cn(
  PRIVACY_BUTTON_CLASS,
  'border-[#F3C9C4] text-[#A1281A] hover:bg-[#FBE4E1]',
);

export const PRIVACY_DANGER_SOLID_BUTTON_CLASS = cn(
  PRIVACY_BUTTON_CLASS,
  'border-[#A1281A] bg-[#A1281A] text-white hover:bg-[#8A1D16] disabled:hover:bg-[#A1281A]',
);

export const PRIVACY_WARNING_NOTE_CLASS =
  'flex gap-3 rounded-2xl bg-[#FDF3EA] px-4 py-3.5 text-sm leading-[1.45] text-[#7A3A07]';

export const PRIVACY_LINK_CLASS = cn('font-semibold underline', FOCUS_CLASS);

/** O diálogo abre em portal, fora do `Header` que aplica a fonte. */
export const PRIVACY_DIALOG_CLASS = cn(
  plusJakartaSans.className,
  'max-h-[90dvh] gap-4 overflow-y-auto rounded-[24px] border-0 bg-white p-7 text-[#0B0B0F] shadow-[0_24px_80px_rgba(15,12,30,0.3)] sm:max-w-[460px]',
  '[&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-[#F4F3F7] [&>button:last-child]:opacity-100',
);

export const PRIVACY_FIELD_CLASS =
  'min-h-[46px] w-full rounded-[12px] border-[#E3E1EA] bg-white px-3.5 text-base font-medium text-[#0B0B0F] shadow-none md:text-sm';

export const PRIVACY_ERROR_CLASS =
  'rounded-[14px] bg-[#FBE4E1] px-3.5 py-3 text-[13px] font-semibold text-[#8F2416]';
