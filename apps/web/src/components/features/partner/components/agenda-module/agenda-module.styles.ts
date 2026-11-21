import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PORTAL_CLASS,
} from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';

export const AGENDA_BUTTON_CLASS = cn(
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50',
  PARTNER_FOCUS_CLASS,
);

export const AGENDA_BUTTON_ACTIVE_CLASS =
  'border-ink bg-ink font-bold text-white hover:bg-ink-hover';

export const AGENDA_BUTTON_BLOCK_ACTIVE_CLASS =
  'border-warning-bg bg-warning-bg font-bold text-warning hover:bg-warning-bg';

export const AGENDA_PROFESSIONAL_SELECT_CLASS =
  'rounded-full border-line-strong bg-white px-3.5 text-[13px] font-semibold text-ink shadow-none data-[size=default]:h-11';

export const AGENDA_FIELD_LABEL_CLASS = 'text-sm font-semibold';

export const AGENDA_FIELD_CLASS =
  'h-[50px] rounded-[14px] border-line-strong bg-white px-3.5 text-[15px] font-medium text-ink shadow-none placeholder:text-ink-muted md:text-[15px]';

export const AGENDA_SELECT_FIELD_CLASS =
  'w-full rounded-[14px] border-line-strong bg-white px-3.5 text-[15px] font-medium text-ink shadow-none data-[placeholder]:text-ink-muted data-[size=default]:h-[50px]';

export const AGENDA_TEXTAREA_CLASS =
  'min-h-[84px] rounded-[14px] border-line-strong bg-white px-3.5 py-3 text-[15px] font-medium text-ink shadow-none placeholder:text-ink-muted md:text-[15px]';

export const AGENDA_MODAL_BUTTON_CLASS = cn(
  'inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-4 text-center text-sm font-bold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50',
  PARTNER_FOCUS_CLASS,
);

export const AGENDA_MODAL_PRIMARY_BUTTON_CLASS =
  'border-ink bg-ink text-white hover:bg-ink-hover';

export const AGENDA_MODAL_DANGER_BUTTON_CLASS =
  'border-error text-error hover:bg-error-bg';

/** O botão de fechar do Dialog é o último filho direto e não expõe `data-slot`. */
export const AGENDA_DIALOG_CLASS = cn(
  PARTNER_PORTAL_CLASS,
  'max-h-[90dvh] gap-3.5 overflow-y-auto rounded-[28px] border-0 p-[30px] sm:max-w-[540px]',
  '[&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-surface-2 [&>button:last-child]:opacity-100',
);

export const AGENDA_DRAWER_CLASS = cn(PARTNER_PORTAL_CLASS, 'max-h-[90dvh]');

export const AGENDA_MODAL_TITLE_CLASS =
  'pr-10 text-left text-2xl font-extrabold tracking-[-0.025em]';
