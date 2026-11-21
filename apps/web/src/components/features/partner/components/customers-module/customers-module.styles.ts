import { cn } from '@repo/ui';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PORTAL_CLASS,
} from '../../partner.styles';

export const CUSTOMERS_TITLE_CLASS =
  'text-2xl font-extrabold tracking-[-0.025em] text-ink';

export const CUSTOMERS_LEAD_CLASS =
  'mt-0.5 text-[15px] leading-normal text-ink-muted';

export const CUSTOMERS_MUTED_CLASS = 'text-ink-muted';

export const CUSTOMERS_BUTTON_CLASS = cn(
  'inline-flex h-[50px] min-w-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-[22px] text-sm font-bold whitespace-nowrap text-ink transition-colors hover:bg-surface disabled:cursor-default disabled:text-ink-faint disabled:hover:bg-white',
  PARTNER_FOCUS_CLASS,
);

export const CUSTOMERS_PRIMARY_BUTTON_CLASS = cn(
  CUSTOMERS_BUTTON_CLASS,
  'border-ink bg-ink text-white hover:bg-ink-hover disabled:bg-ink-hover disabled:text-white/70 disabled:hover:bg-ink-hover',
);

export const CUSTOMERS_SMALL_BUTTON_CLASS = 'h-11 px-[18px] text-[13px]';

export const CUSTOMERS_BUTTON_ICON_CLASS = 'size-[18px] stroke-2';

export const CUSTOMERS_CHIP_CLASS = cn(
  'h-11 cursor-pointer rounded-full border border-line-strong bg-white px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-surface',
  PARTNER_FOCUS_CLASS,
);

export const CUSTOMERS_CHIP_ACTIVE_CLASS =
  'border-ink bg-ink text-white hover:bg-ink-hover';

export const CUSTOMERS_TAG_CLASS =
  'rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold whitespace-nowrap';

export const CUSTOMERS_FIELD_CLASS =
  'h-[50px] w-full rounded-[14px] border-line-strong bg-white px-3.5 text-base font-medium text-ink shadow-none placeholder:text-ink-muted md:text-[15px]';

export const CUSTOMERS_TEXTAREA_CLASS =
  'min-h-[150px] w-full resize-y rounded-[14px] border-line-strong bg-white px-3.5 py-3 text-base leading-normal font-medium text-ink shadow-none placeholder:text-ink-muted md:text-[15px]';

export const CUSTOMERS_FIELD_LABEL_CLASS = 'text-sm font-semibold';

export const CUSTOMERS_CARD_CLASS =
  'min-w-0 rounded-[22px] border border-line p-[22px]';

export const CUSTOMERS_CARD_TITLE_CLASS =
  'text-[17px] font-extrabold tracking-[-0.015em]';

export const CUSTOMERS_CARD_LEAD_CLASS =
  'mt-0.5 mb-3.5 text-[13px] text-ink-muted';

export const CUSTOMERS_PAGER_CLASS =
  'flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted';

export const CUSTOMERS_DIALOG_CLASS = cn(
  PARTNER_PORTAL_CLASS,
  'max-h-[90dvh] gap-4 overflow-y-auto rounded-[28px] border-0 p-[28px] sm:max-w-[520px]',
  '[&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-surface-2 [&>button:last-child]:opacity-100',
);

export const CUSTOMERS_DIALOG_TITLE_CLASS =
  'pr-10 text-left text-2xl font-extrabold tracking-[-0.025em]';

export const CUSTOMERS_STATUS_BADGE_CLASS =
  'rounded-full px-[11px] py-[5px] text-xs font-bold whitespace-nowrap';
