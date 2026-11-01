import { cn } from '@repo/ui';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PORTAL_CLASS,
} from '../../partner.styles';

export const MODULE_TITLE_CLASS =
  'text-2xl font-extrabold tracking-[-0.025em] text-[#0B0B0F]';

export const MODULE_LEAD_CLASS =
  'mt-0.5 text-[15px] leading-normal text-[#5F5C6E]';

export const MODULE_CARD_TITLE_CLASS = 'text-[17px] font-extrabold';

export const MODULE_CARD_CLASS =
  'grid gap-3.5 rounded-[22px] border border-[#EBE9F0] p-[22px]';

export const MODULE_RAISED_CARD_CLASS =
  'grid gap-4 rounded-[24px] p-6 shadow-[0_12px_40px_rgba(15,12,30,0.1)]';

export const MODULE_ACTION_CLASS = cn(
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#E3E1EA] bg-white px-4 text-[13px] font-bold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA] disabled:cursor-not-allowed disabled:opacity-60',
  PARTNER_FOCUS_CLASS,
);

export const MODULE_DANGER_ACTION_CLASS = cn(
  MODULE_ACTION_CLASS,
  'text-[#A4231A] hover:bg-[#FBE8E6]',
);

export const MODULE_PRIMARY_ACTION_CLASS = cn(
  MODULE_ACTION_CLASS,
  'border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]',
);

export const MODULE_FIELD_LABEL_CLASS = 'text-sm font-semibold text-[#0B0B0F]';

export const MODULE_FIELD_CLASS =
  'h-[50px] w-full rounded-[14px] border-[#E3E1EA] bg-white px-3.5 text-base font-medium text-[#0B0B0F] shadow-none placeholder:text-[#6F6C7E] md:text-[15px]';

export const MODULE_BADGE_CLASS =
  'inline-flex items-center rounded-full px-[11px] py-[5px] text-xs font-bold';

export const MODULE_BADGE_TONE_CLASS = {
  neutral: 'bg-[#F4F3F7] text-[#0B0B0F]',
  success: 'bg-[#DFF2E7] text-[#0A5536]',
  warning: 'bg-[#FFF1E0] text-[#6E3B00]',
  danger: 'bg-[#FBE8E6] text-[#A4231A]',
} as const;

export type TModuleBadgeTone = keyof typeof MODULE_BADGE_TONE_CLASS;

export const MODULE_DIALOG_CLASS = cn(
  PARTNER_PORTAL_CLASS,
  'gap-2 rounded-[24px] border-0 bg-white px-6 py-[22px] shadow-[0_20px_60px_rgba(15,12,30,0.18)]',
);

export const MODULE_DIALOG_TITLE_CLASS =
  'text-xl font-extrabold tracking-[-0.02em] text-[#0B0B0F]';

export const MODULE_DIALOG_TEXT_CLASS = 'text-sm leading-normal text-[#5F5C6E]';

const MODULE_DIALOG_BUTTON_CLASS = cn(
  'h-auto min-h-[46px] cursor-pointer rounded-full px-5 text-sm font-bold shadow-none',
  PARTNER_FOCUS_CLASS,
);

export const MODULE_DIALOG_CANCEL_CLASS = cn(
  MODULE_DIALOG_BUTTON_CLASS,
  'border border-[#E3E1EA] bg-white text-[#0B0B0F] hover:bg-[#F7F6FA] hover:text-[#0B0B0F]',
);

export const MODULE_DIALOG_DANGER_CLASS = cn(
  MODULE_DIALOG_BUTTON_CLASS,
  'border border-[#A4231A] bg-[#A4231A] text-white hover:bg-[#8A1D16]',
);

export const MODULE_DIALOG_PRIMARY_CLASS = cn(
  MODULE_DIALOG_BUTTON_CLASS,
  'border border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]',
);
