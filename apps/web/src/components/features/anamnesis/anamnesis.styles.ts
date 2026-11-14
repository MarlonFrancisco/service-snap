import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

export const ANAMNESIS_PAGE_CLASS = cn(
  plusJakartaSans.className,
  'min-h-dvh bg-white text-[#0B0B0F]',
);

export const ANAMNESIS_MAIN_CLASS =
  'mx-auto flex w-full max-w-[480px] flex-col gap-[18px] px-4 pt-5 pb-8';

export const ANAMNESIS_CARD_CLASS =
  'flex flex-col gap-[18px] rounded-[24px] border border-[#EBE9F0] bg-white p-[18px]';

export const ANAMNESIS_TEXT_CLASS = 'text-sm leading-normal text-[#5F5C6E]';

export const ANAMNESIS_LABEL_CLASS = 'grid gap-1.5 text-[13px] font-bold';

export const ANAMNESIS_HINT_CLASS = 'font-medium text-[#5F5C6E]';

export const ANAMNESIS_INPUT_CLASS = cn(
  'min-h-[46px] w-full rounded-[12px] border border-[#E3E1EA] bg-white px-3.5 text-base font-medium text-[#0B0B0F] placeholder:text-[#6F6C7E] aria-[invalid=true]:border-[#A4231A]',
  FOCUS_CLASS,
);

export const ANAMNESIS_TEXTAREA_CLASS = cn(
  ANAMNESIS_INPUT_CLASS,
  'min-h-24 resize-y py-3 leading-normal',
);

export const ANAMNESIS_CHECK_CLASS =
  'flex min-h-11 cursor-pointer items-start gap-2.5 text-sm leading-[1.45] font-medium';

export const ANAMNESIS_CHECK_INPUT_CLASS =
  'mt-0.5 size-5 shrink-0 accent-[#9810FA]';

export const ANAMNESIS_ERROR_CLASS = 'text-[13px] font-semibold text-[#A4231A]';

export const ANAMNESIS_PRIMARY_BUTTON_CLASS = cn(
  'inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#0B0B0F] bg-[#0B0B0F] px-[18px] text-sm font-bold text-white transition-colors hover:bg-[#2B2B2B] disabled:cursor-default disabled:opacity-70',
  FOCUS_CLASS,
);
