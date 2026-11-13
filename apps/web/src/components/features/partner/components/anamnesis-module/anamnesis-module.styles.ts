import { cn } from '@repo/ui';
import { PARTNER_FOCUS_CLASS } from '../../partner.styles';

export const ANAMNESIS_CARD_CLASS =
  'flex min-w-0 flex-col gap-4 rounded-[24px] bg-white p-6 shadow-[0_12px_40px_rgba(15,12,30,0.1)]';

/** Cartão dentro de outra tela (detalhes, ficha do cliente): só borda. */
export const ANAMNESIS_INLINE_CARD_CLASS =
  'flex min-w-0 flex-col gap-3.5 rounded-[22px] border border-[#EBE9F0] p-[18px]';

export const ANAMNESIS_CARD_TITLE_CLASS =
  'text-xl font-extrabold tracking-[-0.02em]';

export const ANAMNESIS_TEXT_CLASS = 'text-sm leading-normal text-[#5F5C6E]';

export const ANAMNESIS_CAPTION_CLASS =
  'text-[13px] font-bold tracking-[0.06em] text-[#5F5C6E] uppercase';

export const ANAMNESIS_ITEM_CLASS =
  'flex items-center justify-between gap-3 rounded-[16px] border border-[#EBE9F0] px-4 py-3.5';

export const ANAMNESIS_CHIP_CLASS =
  'inline-flex items-center gap-1.5 rounded-full px-[11px] py-1 text-xs font-bold whitespace-nowrap';

export const ANAMNESIS_CHIP_TONE = {
  ok: 'bg-[#DFF2E7] text-[#0A5536]',
  warning: 'bg-[#FBE8D9] text-[#7A3A07]',
  neutral: 'bg-[#F4F3F7] text-[#3D3A4A]',
} as const;

export const ANAMNESIS_NOTE_CLASS =
  'flex gap-3 rounded-[16px] bg-[#F7F6FA] px-4 py-3.5 text-sm leading-[1.45] text-[#3D3A4A]';

export const ANAMNESIS_LOCK_NOTE_CLASS = cn(
  ANAMNESIS_NOTE_CLASS,
  'bg-[#F2F0FB] text-[#3B2A6B]',
);

export const ANAMNESIS_NOTE_ICON_CLASS = 'mt-px size-5 shrink-0 stroke-2';

export const ANAMNESIS_LABEL_CLASS =
  'grid content-start gap-1.5 text-sm font-semibold';

export const ANAMNESIS_HINT_CLASS = 'font-medium text-[#5F5C6E]';

export const ANAMNESIS_FIELD_CLASS =
  'h-[50px] w-full rounded-[14px] border-[#E3E1EA] bg-white px-3.5 text-base font-medium text-[#0B0B0F] shadow-none placeholder:text-[#6F6C7E] md:text-[15px]';

export const ANAMNESIS_SELECT_CLASS =
  'w-full rounded-[14px] border-[#E3E1EA] bg-white px-3.5 text-base font-medium text-[#0B0B0F] shadow-none data-[placeholder]:text-[#6F6C7E] data-[size=default]:h-[50px] md:text-[15px]';

export const ANAMNESIS_TEXTAREA_CLASS =
  'min-h-24 w-full resize-y rounded-[14px] border-[#E3E1EA] bg-white px-3.5 py-3 text-base leading-normal font-medium text-[#0B0B0F] shadow-none placeholder:text-[#6F6C7E] md:text-[15px]';

export const ANAMNESIS_ERROR_CLASS = 'text-[13px] font-semibold text-[#A4231A]';

export const ANAMNESIS_CHECK_INPUT_CLASS =
  'mt-0.5 size-5 shrink-0 accent-[#9810FA]';

export const ANAMNESIS_DANGER_BUTTON_CLASS =
  'border-[#F3C9C4] text-[#A1281A] hover:bg-[#FBE4E2]';

export const ANAMNESIS_TOGGLE_CLASS = cn(
  'h-11 cursor-pointer rounded-full border border-[#E3E1EA] bg-white px-4 text-[13px] font-semibold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA]',
  PARTNER_FOCUS_CLASS,
);

export const ANAMNESIS_TOGGLE_ACTIVE_CLASS =
  'border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]';
