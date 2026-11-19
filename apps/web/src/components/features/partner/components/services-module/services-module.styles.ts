import { cn } from '@repo/ui';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PRIMARY_ACTION_CLASS,
} from '../../partner.styles';

const SERVICES_BUTTON_BASE_CLASS = cn(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-[18px] text-center text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-60',
  PARTNER_FOCUS_CLASS,
);

export const SERVICES_BUTTON_CLASS = cn(
  SERVICES_BUTTON_BASE_CLASS,
  'border-line-strong bg-white font-semibold text-ink hover:bg-surface',
);

export const SERVICES_DANGER_OUTLINE_BUTTON_CLASS = cn(
  SERVICES_BUTTON_BASE_CLASS,
  'border-line-strong bg-white font-semibold text-error hover:bg-error-bg',
);

export const SERVICES_PRIMARY_BUTTON_CLASS = cn(
  PARTNER_PRIMARY_ACTION_CLASS,
  'gap-2 disabled:cursor-not-allowed disabled:opacity-60',
);

export const SERVICES_DANGER_BUTTON_CLASS = cn(
  SERVICES_BUTTON_BASE_CLASS,
  'border-error bg-error font-bold text-white hover:bg-error-strong',
);

export const SERVICES_MODAL_ACTION_CLASS = 'min-h-12 flex-1 text-sm font-bold';

export const SERVICES_FIELD_LABEL_CLASS = 'text-sm font-semibold';

export const SERVICES_INPUT_CLASS = cn(
  'h-[50px] w-full rounded-[14px] border border-line-strong bg-white px-3.5 text-[15px] font-medium text-ink placeholder:text-ink-muted aria-invalid:border-error',
  PARTNER_FOCUS_CLASS,
);

export const SERVICES_SELECT_TRIGGER_CLASS =
  'w-full rounded-[14px] border-line-strong bg-white px-3.5 text-[15px] font-medium text-ink shadow-none focus-visible:ring-2 focus-visible:ring-ink data-[placeholder]:text-ink-muted data-[size=default]:h-[50px]';

export const SERVICES_KPI_GRID_CLASS =
  'grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3.5';
