import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

const BUTTON_CLASS = cn(
  'inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border px-[18px] text-sm font-bold transition-colors disabled:cursor-default disabled:opacity-70',
  FOCUS_CLASS,
);

export const OPT_OUT_PAGE_CLASS = cn(
  plusJakartaSans.className,
  'min-h-dvh bg-white text-[#0B0B0F]',
);

export const OPT_OUT_MAIN_CLASS =
  'mx-auto flex w-full max-w-[480px] flex-col gap-[18px] px-4 pt-5 pb-8';

export const OPT_OUT_CARD_CLASS =
  'flex flex-col gap-3.5 rounded-[24px] border border-[#EBE9F0] bg-white p-[18px]';

export const OPT_OUT_CENTERED_CARD_CLASS = cn(
  OPT_OUT_CARD_CLASS,
  'items-center text-center',
);

export const OPT_OUT_CARD_TITLE_CLASS =
  'text-xl font-extrabold tracking-[-0.02em]';

export const OPT_OUT_TEXT_CLASS = 'text-sm leading-normal text-[#5F5C6E]';

export const OPT_OUT_PRIMARY_BUTTON_CLASS = cn(
  BUTTON_CLASS,
  'border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]',
);

export const OPT_OUT_SECONDARY_BUTTON_CLASS = cn(
  BUTTON_CLASS,
  'border-[#E3E1EA] bg-white text-[#0B0B0F] hover:bg-[#F4F3F7]',
);
