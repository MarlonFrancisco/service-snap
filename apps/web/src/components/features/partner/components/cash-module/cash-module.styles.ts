import { cn } from '@repo/ui';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PORTAL_CLASS,
} from '../../partner.styles';

/**
 * Linguagem visual das telas de gestão (caixa, comissões e fechamento):
 * cartões com borda, botões em pílula e tabela com cabeçalho cinza.
 */
export const MANAGEMENT_TITLE_CLASS =
  'text-2xl font-extrabold tracking-[-0.025em] text-ink';

export const MANAGEMENT_LEAD_CLASS =
  'mt-0.5 text-sm leading-normal text-ink-muted';

export const MANAGEMENT_MUTED_CLASS = 'text-ink-muted';

export const MANAGEMENT_CAPTION_CLASS =
  'text-[13px] font-bold tracking-[0.06em] text-ink-muted uppercase';

export const MANAGEMENT_CARD_CLASS =
  'flex min-w-0 flex-col gap-4 rounded-[24px] border border-line bg-white p-6';

export const MANAGEMENT_CARD_TITLE_CLASS =
  'text-xl font-extrabold tracking-[-0.02em]';

export const MANAGEMENT_SUBTITLE_CLASS = 'text-base font-extrabold';

export const MANAGEMENT_BUTTON_CLASS = cn(
  'inline-flex min-h-[46px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-[18px] text-sm font-bold whitespace-nowrap text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white',
  PARTNER_FOCUS_CLASS,
);

export const MANAGEMENT_PRIMARY_BUTTON_CLASS = cn(
  MANAGEMENT_BUTTON_CLASS,
  'border-ink bg-ink text-white hover:bg-ink-hover disabled:hover:bg-ink',
);

export const MANAGEMENT_DANGER_BUTTON_CLASS =
  'border-error-line text-error hover:bg-error-bg';

export const MANAGEMENT_SMALL_BUTTON_CLASS = 'min-h-11 px-3.5 text-[13px]';

export const MANAGEMENT_BUTTON_ICON_CLASS = 'size-[18px] stroke-2';

export const MANAGEMENT_ACTIONS_CLASS = 'flex flex-wrap gap-2.5';

export const MANAGEMENT_CHIP_CLASS =
  'inline-flex items-center gap-1.5 rounded-full px-[11px] py-1 text-xs font-bold whitespace-nowrap';

export const MANAGEMENT_CHIP_TONE = {
  ok: 'bg-success-bg text-success',
  info: 'bg-info-bg text-info',
  warning: 'bg-warning-bg text-warning',
  error: 'bg-error-bg text-error-strong',
  neutral: 'bg-surface-2 text-ink-soft',
} as const;

export const MANAGEMENT_FIELD_LABEL_CLASS =
  'grid gap-1.5 text-[13px] font-bold';

export const MANAGEMENT_FIELD_HINT_CLASS = 'font-medium text-ink-muted';

export const MANAGEMENT_FIELD_CLASS = cn(
  'min-h-[46px] w-full rounded-[12px] border border-line-strong bg-white px-3.5 text-base font-medium text-ink shadow-none placeholder:text-ink-muted aria-[invalid=true]:border-error md:text-sm',
  PARTNER_FOCUS_CLASS,
);

export const MANAGEMENT_TEXTAREA_CLASS = cn(
  MANAGEMENT_FIELD_CLASS,
  'min-h-24 resize-y py-3 leading-normal',
);

export const MANAGEMENT_SELECT_CLASS =
  'w-full rounded-[12px] border-line-strong bg-white px-3.5 text-base font-medium text-ink shadow-none data-[placeholder]:text-ink-muted data-[size=default]:h-[46px] md:text-sm';

export const MANAGEMENT_ERROR_CLASS =
  'text-[13px] font-semibold text-error';

export const MANAGEMENT_ROW_CLASS = 'flex items-center justify-between gap-3';

export const MANAGEMENT_ITEM_CLASS =
  'flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3.5';

export const MANAGEMENT_LINE_CLASS = 'flex min-w-0 flex-col gap-0.5';

export const MANAGEMENT_LINE_TITLE_CLASS = 'text-sm font-bold';

export const MANAGEMENT_LINE_TEXT_CLASS = 'text-[13px] text-ink-muted';

export const MANAGEMENT_NOTE_CLASS =
  'flex gap-3 rounded-2xl bg-surface px-4 py-3.5 text-sm leading-[1.45] text-ink-soft';

export const MANAGEMENT_NOTE_TONE = {
  neutral: 'bg-surface text-ink-soft',
  success: 'bg-success-bg-soft text-success',
  warning: 'bg-warning-bg text-warning',
  info: 'bg-info-bg text-info',
  lock: 'bg-brand-tint text-brand-ink',
} as const;

export const MANAGEMENT_NOTE_ICON_CLASS = 'mt-px size-5 flex-none stroke-2';

export const MANAGEMENT_TEXT_CLASS = 'text-sm leading-normal text-ink-muted';

export const MANAGEMENT_KPI_CLASS =
  'flex min-w-0 flex-col gap-1 rounded-[20px] border border-line bg-white p-[18px]';

export const MANAGEMENT_KPI_LABEL_CLASS = 'text-[13px] text-ink-muted';

export const MANAGEMENT_KPI_VALUE_CLASS =
  'text-[22px] font-extrabold tracking-[-0.02em] tabular-nums';

export const MANAGEMENT_SUMMARY_CLASS = 'grid gap-2.5 text-sm';

export const MANAGEMENT_SUMMARY_ROW_CLASS = 'flex justify-between gap-4';

export const MANAGEMENT_SUMMARY_TOTAL_CLASS =
  'border-t border-line pt-2.5 text-base font-extrabold text-ink';

export const MANAGEMENT_TABLE_WRAPPER_CLASS = cn(
  'overflow-x-auto rounded-[20px] border border-line bg-white',
  PARTNER_FOCUS_CLASS,
);

export const MANAGEMENT_TABLE_CLASS = 'w-full border-collapse text-sm';

export const MANAGEMENT_HEAD_CELL_CLASS =
  'border-b border-line bg-surface px-4 py-3 text-left text-xs font-bold whitespace-nowrap text-ink-muted';

export const MANAGEMENT_CELL_CLASS =
  'border-b border-surface-3 px-4 py-3 align-middle group-last:border-b-0';

export const MANAGEMENT_NUMBER_CLASS =
  'text-right whitespace-nowrap tabular-nums';

export const MANAGEMENT_SEGMENTED_CLASS =
  'flex gap-1.5 self-start rounded-full bg-surface-2 p-1';

export const MANAGEMENT_SEGMENT_CLASS = cn(
  'min-h-10 cursor-pointer rounded-full px-4 text-[13px] font-bold text-ink-muted transition-colors hover:text-ink',
  PARTNER_FOCUS_CLASS,
);

export const MANAGEMENT_SEGMENT_ACTIVE_CLASS =
  'bg-white text-ink shadow-[0_2px_8px_rgba(15,12,30,0.1)]';

export const MANAGEMENT_CHECK_CLASS =
  'flex min-h-11 cursor-pointer items-start gap-2.5 text-sm leading-[1.45]';

export const MANAGEMENT_CHECKBOX_CLASS =
  'mt-0.5 size-5 flex-none cursor-pointer accent-brand';

export const MANAGEMENT_DIALOG_CLASS = cn(
  PARTNER_PORTAL_CLASS,
  'max-h-[90dvh] gap-4 overflow-y-auto rounded-[24px] border-0 p-7 sm:max-w-[460px]',
  '[&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-surface-2 [&>button:last-child]:opacity-100',
);

export const MANAGEMENT_WIDE_DIALOG_CLASS = 'sm:max-w-[720px]';

export const MANAGEMENT_DIALOG_TITLE_CLASS =
  'pr-10 text-left text-[22px] font-extrabold tracking-[-0.02em]';
