import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PORTAL_CLASS,
} from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';

export const AGENDA_BUTTON_CLASS = cn(
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-[#E3E1EA] bg-white px-4 text-[13px] font-semibold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA] disabled:cursor-not-allowed disabled:opacity-50',
  PARTNER_FOCUS_CLASS,
);

export const AGENDA_BUTTON_ACTIVE_CLASS =
  'border-[#0B0B0F] bg-[#0B0B0F] font-bold text-white hover:bg-[#2B2B2B]';

export const AGENDA_BUTTON_BLOCK_ACTIVE_CLASS =
  'border-[#FFF1E0] bg-[#FFF1E0] font-bold text-[#8A4B00] hover:bg-[#FFE7CC]';

export const AGENDA_PROFESSIONAL_SELECT_CLASS =
  'rounded-full border-[#E3E1EA] bg-white px-3.5 text-[13px] font-semibold text-[#0B0B0F] shadow-none data-[size=default]:h-11';

export const AGENDA_FIELD_LABEL_CLASS = 'text-sm font-semibold';

export const AGENDA_FIELD_CLASS =
  'h-[50px] rounded-[14px] border-[#E3E1EA] bg-white px-3.5 text-[15px] font-medium text-[#0B0B0F] shadow-none placeholder:text-[#6F6C7E] md:text-[15px]';

export const AGENDA_SELECT_FIELD_CLASS =
  'w-full rounded-[14px] border-[#E3E1EA] bg-white px-3.5 text-[15px] font-medium text-[#0B0B0F] shadow-none data-[placeholder]:text-[#6F6C7E] data-[size=default]:h-[50px]';

export const AGENDA_TEXTAREA_CLASS =
  'min-h-[84px] rounded-[14px] border-[#E3E1EA] bg-white px-3.5 py-3 text-[15px] font-medium text-[#0B0B0F] shadow-none placeholder:text-[#6F6C7E] md:text-[15px]';

export const AGENDA_MODAL_BUTTON_CLASS = cn(
  'inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full border border-[#E3E1EA] bg-white px-4 text-center text-sm font-bold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA] disabled:cursor-not-allowed disabled:opacity-50',
  PARTNER_FOCUS_CLASS,
);

export const AGENDA_MODAL_PRIMARY_BUTTON_CLASS =
  'border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]';

export const AGENDA_MODAL_DANGER_BUTTON_CLASS =
  'border-[#A4231A] text-[#A4231A] hover:bg-[#FBE4E2]';

/** O botão de fechar do Dialog é o último filho direto e não expõe `data-slot`. */
export const AGENDA_DIALOG_CLASS = cn(
  PARTNER_PORTAL_CLASS,
  'max-h-[90dvh] gap-3.5 overflow-y-auto rounded-[28px] border-0 p-[30px] sm:max-w-[540px]',
  '[&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-[#F4F3F7] [&>button:last-child]:opacity-100',
);

export const AGENDA_DRAWER_CLASS = cn(PARTNER_PORTAL_CLASS, 'max-h-[90dvh]');

export const AGENDA_MODAL_TITLE_CLASS =
  'pr-10 text-left text-2xl font-extrabold tracking-[-0.025em]';
