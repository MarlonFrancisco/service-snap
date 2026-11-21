import { cn } from '@repo/ui';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PORTAL_CLASS,
} from '../../partner.styles';

export const MODULE_TITLE_CLASS =
  'text-2xl font-extrabold tracking-[-0.025em] text-ink';

export const MODULE_LEAD_CLASS =
  'mt-0.5 text-[15px] leading-normal text-ink-muted';

export const MODULE_CARD_TITLE_CLASS = 'text-[17px] font-extrabold';

export const MODULE_CARD_CLASS =
  'grid gap-3.5 rounded-[22px] border border-line p-[22px]';

export const MODULE_RAISED_CARD_CLASS =
  'grid gap-4 rounded-[24px] p-6 shadow-[0_12px_40px_rgba(15,12,30,0.1)]';

export const MODULE_ACTION_CLASS = cn(
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-4 text-[13px] font-bold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
  PARTNER_FOCUS_CLASS,
);

export const MODULE_DANGER_ACTION_CLASS = cn(
  MODULE_ACTION_CLASS,
  'text-error hover:bg-error-bg',
);

export const MODULE_PRIMARY_ACTION_CLASS = cn(
  MODULE_ACTION_CLASS,
  'border-ink bg-ink text-white hover:bg-ink-hover',
);

export const MODULE_FIELD_LABEL_CLASS = 'text-sm font-semibold text-ink';

export const MODULE_FIELD_CLASS =
  'h-[50px] w-full rounded-[14px] border-line-strong bg-white px-3.5 text-base font-medium text-ink shadow-none placeholder:text-ink-muted md:text-[15px]';

export const MODULE_BADGE_CLASS =
  'inline-flex items-center rounded-full px-[11px] py-[5px] text-xs font-bold';

export const MODULE_BADGE_TONE_CLASS = {
  neutral: 'bg-surface-2 text-ink',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-error-bg text-error',
} as const;

export type TModuleBadgeTone = keyof typeof MODULE_BADGE_TONE_CLASS;

export const MODULE_DIALOG_CLASS = cn(
  PARTNER_PORTAL_CLASS,
  'gap-2 rounded-[24px] border-0 bg-white px-6 py-[22px] shadow-[0_20px_60px_rgba(15,12,30,0.18)]',
);

export const MODULE_DIALOG_TITLE_CLASS =
  'text-xl font-extrabold tracking-[-0.02em] text-ink';

export const MODULE_DIALOG_TEXT_CLASS = 'text-sm leading-normal text-ink-muted';

const MODULE_DIALOG_BUTTON_CLASS = cn(
  'h-auto min-h-[46px] cursor-pointer rounded-full px-5 text-sm font-bold shadow-none',
  PARTNER_FOCUS_CLASS,
);

export const MODULE_DIALOG_CANCEL_CLASS = cn(
  MODULE_DIALOG_BUTTON_CLASS,
  'border border-line-strong bg-white text-ink hover:bg-surface hover:text-ink',
);

export const MODULE_DIALOG_DANGER_CLASS = cn(
  MODULE_DIALOG_BUTTON_CLASS,
  'border border-error bg-error text-white hover:bg-error-strong',
);

export const MODULE_DIALOG_PRIMARY_CLASS = cn(
  MODULE_DIALOG_BUTTON_CLASS,
  'border border-ink bg-ink text-white hover:bg-ink-hover',
);
