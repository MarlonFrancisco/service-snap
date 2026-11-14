import { cn } from '@repo/ui';

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

export const READY_WHATSAPP_CARD_CLASS =
  'mb-6 flex flex-col gap-3.5 rounded-3xl bg-white p-6 text-[#0B0B0F] shadow-[0_12px_40px_rgba(15,12,30,0.1)]';

export const READY_WHATSAPP_TITLE_CLASS =
  'text-lg font-extrabold tracking-[-0.01em]';

export const READY_WHATSAPP_TEXT_CLASS =
  'text-sm leading-normal text-[#5F5C6E]';

export const READY_WHATSAPP_BUTTON_CLASS = `inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-full border border-[#E3E1EA] bg-white px-[18px] text-sm font-bold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA] ${FOCUS_RING}`;

export const READY_WHATSAPP_QUIET_BUTTON_CLASS = cn(
  READY_WHATSAPP_BUTTON_CLASS,
  'border-transparent text-[#5F5C6E]',
);
