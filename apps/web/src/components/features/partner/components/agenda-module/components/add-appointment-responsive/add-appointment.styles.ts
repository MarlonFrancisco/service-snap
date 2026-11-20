import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PORTAL_CLASS,
} from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';

/** O botão de fechar do Dialog é o último filho direto e não expõe `data-slot`. */
export const ADD_APPOINTMENT_DIALOG_CLASS = cn(
  PARTNER_PORTAL_CLASS,
  'max-h-[92dvh] gap-0 overflow-y-auto rounded-[28px] border-0 p-7 sm:max-w-[min(1140px,calc(100%-2rem))]',
  '[&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-surface-2 [&>button:last-child]:opacity-100',
);

export const ADD_APPOINTMENT_DRAWER_CLASS = cn(
  PARTNER_PORTAL_CLASS,
  'max-h-[92dvh]',
);

export const ADD_APPOINTMENT_TITLE_CLASS =
  'pr-10 text-left text-2xl font-extrabold tracking-[-0.025em]';

export const ADD_APPOINTMENT_LABEL_CLASS = 'text-sm font-semibold';

export const ADD_APPOINTMENT_LEGEND_CLASS = 'p-0 text-sm font-bold';

export const ADD_APPOINTMENT_FIELD_CLASS =
  'h-[50px] w-full rounded-[14px] border-line-strong bg-white px-3.5 text-base font-medium text-ink shadow-none placeholder:text-ink-muted md:text-[15px]';

export const ADD_APPOINTMENT_SELECT_CLASS =
  'w-full rounded-[14px] border-line-strong bg-white px-3.5 text-base font-medium text-ink shadow-none data-[placeholder]:text-ink-muted data-[size=default]:h-[50px] md:text-[15px]';

export const ADD_APPOINTMENT_TEXTAREA_CLASS =
  'min-h-16 resize-y rounded-[14px] border-line-strong bg-white px-3.5 py-3 text-base font-medium text-ink shadow-none placeholder:text-ink-muted md:text-[15px]';

export const ADD_APPOINTMENT_HINT_CLASS =
  'text-[13px] font-medium text-ink-muted';

export const ADD_APPOINTMENT_ERROR_CLASS =
  'text-[13px] font-semibold text-error';

/** Cartão de opção (cliente da busca, serviço): borda escura quando marcado. */
export const ADD_APPOINTMENT_OPTION_CLASS =
  'flex min-h-[60px] cursor-pointer items-center gap-3 rounded-[16px] border border-line-strong px-3.5 py-2 transition-colors hover:bg-surface has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink';

export const ADD_APPOINTMENT_OPTION_ACTIVE_CLASS =
  'border-ink bg-surface';

export const ADD_APPOINTMENT_OPTION_INPUT_CLASS =
  'size-5 shrink-0 accent-ink';

export const ADD_APPOINTMENT_SEGMENT_CLASS = cn(
  'h-10 cursor-pointer rounded-full px-4 text-[13px] font-bold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50',
  PARTNER_FOCUS_CLASS,
);

export const ADD_APPOINTMENT_SEGMENT_ACTIVE_CLASS =
  'bg-ink text-white hover:bg-ink-hover';

export const ADD_APPOINTMENT_TIME_CLASS = cn(
  'h-11 min-w-[76px] cursor-pointer rounded-full border border-line-strong bg-white px-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface',
  PARTNER_FOCUS_CLASS,
);

export const ADD_APPOINTMENT_TIME_ACTIVE_CLASS =
  'border-ink bg-ink text-white hover:bg-ink-hover';

export const ADD_APPOINTMENT_LINK_BUTTON_CLASS = cn(
  'inline-flex min-h-11 cursor-pointer items-center px-1 text-[13px] font-bold text-ink underline underline-offset-[3px]',
  PARTNER_FOCUS_CLASS,
);

export const ADD_APPOINTMENT_BUTTON_CLASS = cn(
  'inline-flex min-h-[50px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-4 text-center text-sm font-bold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50',
  PARTNER_FOCUS_CLASS,
);

export const ADD_APPOINTMENT_PRIMARY_BUTTON_CLASS =
  'border-ink bg-ink text-white hover:bg-ink-hover';

export const ADD_APPOINTMENT_NOTICE_CLASS =
  'rounded-[14px] bg-surface px-3.5 py-3 text-[13px] font-medium text-ink-muted';

export const ADD_APPOINTMENT_WARNING_CLASS =
  'm-0 rounded-[14px] bg-warning-bg px-3.5 py-3 text-[13px] leading-[1.45] font-semibold text-warning';
