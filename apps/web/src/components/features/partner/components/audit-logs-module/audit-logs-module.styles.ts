import { cn } from '@repo/ui';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PORTAL_CLASS,
} from '../../partner.styles';

/**
 * Peças visuais das telas da Fase 4 (histórico, integrações e painel da
 * plataforma): cartão, botões, selos, campos e tabela do desenho.
 */
export const PANEL_TITLE_CLASS =
  'text-2xl font-extrabold tracking-[-0.025em] text-ink';

export const PANEL_TEXT_CLASS = 'text-sm leading-normal text-ink-muted';

export const PANEL_CAPTION_CLASS =
  'text-[13px] font-bold tracking-[0.06em] text-ink-muted uppercase';

export const PANEL_CARD_CLASS =
  'flex min-w-0 flex-col gap-4 rounded-[24px] bg-white p-6 shadow-[0_12px_40px_rgba(15,12,30,0.1)]';

export const PANEL_CARD_TITLE_CLASS =
  'text-xl font-extrabold tracking-[-0.02em] text-ink';

export const PANEL_BUTTON_CLASS = cn(
  'inline-flex min-h-[46px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-[18px] text-sm font-bold whitespace-nowrap text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
  PARTNER_FOCUS_CLASS,
);

export const PANEL_SMALL_BUTTON_CLASS = 'min-h-11 px-3.5 text-[13px]';

export const PANEL_PRIMARY_BUTTON_CLASS = cn(
  PANEL_BUTTON_CLASS,
  'border-ink bg-ink text-white hover:bg-ink-hover',
);

export const PANEL_DANGER_BUTTON_CLASS = cn(
  PANEL_BUTTON_CLASS,
  'border-error-line text-error hover:bg-error-bg',
);

export const PANEL_DANGER_SOLID_BUTTON_CLASS = cn(
  PANEL_BUTTON_CLASS,
  'border-error bg-error text-white hover:bg-error-strong',
);

export const PANEL_BUTTON_ICON_CLASS = 'size-[18px] stroke-2';

export const PANEL_CHIP_CLASS =
  'inline-flex items-center gap-1.5 rounded-full px-[11px] py-1 text-xs font-bold whitespace-nowrap';

export const PANEL_CHIP_TONE_CLASS = {
  success: 'bg-success-bg text-success',
  info: 'bg-info-bg text-info',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-error-bg text-error-strong',
  neutral: 'bg-surface-2 text-ink-soft',
} as const;

export const PANEL_FIELD_LABEL_CLASS =
  'grid gap-1.5 text-[13px] font-bold text-ink';

export const PANEL_FIELD_HINT_CLASS = 'font-medium text-ink-muted';

export const PANEL_FIELD_CLASS =
  'min-h-[46px] w-full rounded-[12px] border-line-strong bg-white px-3.5 text-base font-medium text-ink shadow-none placeholder:text-ink-muted md:text-sm';

export const PANEL_TEXTAREA_CLASS =
  'min-h-24 w-full resize-y rounded-[12px] border-line-strong bg-white px-3.5 py-3 text-base leading-normal font-medium text-ink shadow-none placeholder:text-ink-muted md:text-sm';

export const PANEL_SELECT_TRIGGER_CLASS =
  'min-h-[46px] w-full cursor-pointer rounded-[12px] border-line-strong bg-white px-3.5 text-sm font-medium text-ink shadow-none data-[size=default]:h-[46px]';

export const PANEL_ITEM_CLASS =
  'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3.5';

export const PANEL_NOTE_CLASS =
  'flex gap-3 rounded-2xl bg-surface px-4 py-3.5 text-sm leading-[1.45] text-ink-soft';

export const PANEL_WARNING_NOTE_CLASS = cn(
  PANEL_NOTE_CLASS,
  'bg-warning-bg text-warning',
);

export const PANEL_NOTE_ICON_CLASS = 'mt-px size-5 shrink-0 stroke-2';

export const PANEL_CODE_CLASS = 'font-mono text-[13px]';

export const PANEL_TABLE_WRAPPER_CLASS = cn(
  'overflow-x-auto rounded-[20px] border border-line bg-white',
  PARTNER_FOCUS_CLASS,
);

export const PANEL_TABLE_CLASS = 'w-full border-collapse text-sm';

export const PANEL_HEAD_CELL_CLASS =
  'border-b border-line bg-surface px-4 py-3 text-left text-xs font-bold whitespace-nowrap text-ink-muted';

export const PANEL_CELL_CLASS =
  'border-b border-surface-3 px-4 py-3 align-middle group-last:border-b-0';

export const PANEL_NUMBER_CLASS = 'text-right whitespace-nowrap tabular-nums';

export const PANEL_PAGER_CLASS =
  'flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted';

export const PANEL_DIALOG_CLASS = cn(
  PARTNER_PORTAL_CLASS,
  'max-h-[90dvh] gap-4 overflow-y-auto rounded-[24px] border-0 bg-white p-7 shadow-[0_24px_80px_rgba(15,12,30,0.3)] sm:max-w-[520px]',
  '[&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-surface-2 [&>button:last-child]:opacity-100',
);

export const PANEL_DIALOG_TITLE_CLASS =
  'pr-10 text-left text-[22px] font-extrabold tracking-[-0.02em] text-ink';

export const PANEL_ERROR_CLASS =
  'rounded-[14px] bg-error-bg px-3.5 py-3 text-[13px] font-semibold text-error-strong';

export const PANEL_DETAILS_LIST_CLASS = 'm-0 grid gap-2.5 text-sm';

export const PANEL_DETAILS_ROW_CLASS = 'flex justify-between gap-4';

export const PANEL_DETAILS_TERM_CLASS = 'text-ink-muted';

export const PANEL_DETAILS_VALUE_CLASS =
  'm-0 min-w-0 text-right font-semibold break-words';
