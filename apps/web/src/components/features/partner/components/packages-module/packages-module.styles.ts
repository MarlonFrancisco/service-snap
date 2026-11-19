import { cn } from '@repo/ui';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PORTAL_CLASS,
} from '../../partner.styles';

/**
 * Linguagem visual das telas de retenção (pacotes, fidelidade e campanhas).
 * Fidelidade e campanhas importam daqui para as três ficarem iguais.
 */

export const RETENTION_TITLE_CLASS =
  'text-2xl font-extrabold tracking-[-0.025em] text-ink';

export const RETENTION_LEAD_CLASS =
  'mt-0.5 text-sm leading-normal text-ink-muted';

export const RETENTION_CAPTION_CLASS =
  'text-[13px] font-bold tracking-[0.06em] text-ink-muted uppercase';

/** Cartão elevado do desenho (`.cd`). */
export const RETENTION_CARD_CLASS =
  'flex min-w-0 flex-col gap-4 rounded-[24px] bg-white p-6 shadow-[0_12px_40px_rgba(15,12,30,0.1)]';

export const RETENTION_CARD_TITLE_CLASS =
  'text-xl font-extrabold tracking-[-0.02em] break-words';

export const RETENTION_SUBTITLE_CLASS = 'text-base font-extrabold';

export const RETENTION_TEXT_CLASS = 'text-sm leading-normal text-ink-muted';

/** Linha de item (`.it`). */
export const RETENTION_ITEM_CLASS =
  'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3.5';

export const RETENTION_ITEM_LINES_CLASS =
  'flex min-w-0 flex-col gap-0.5 [&>b]:text-sm [&>b]:break-words [&>span]:text-[13px] [&>span]:text-ink-muted';

const BUTTON_BASE_CLASS = cn(
  'inline-flex min-h-[46px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border px-[18px] text-sm font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60',
  PARTNER_FOCUS_CLASS,
);

export const RETENTION_BUTTON_CLASS = cn(
  BUTTON_BASE_CLASS,
  'border-line-strong bg-white text-ink hover:bg-surface',
);

export const RETENTION_PRIMARY_BUTTON_CLASS = cn(
  BUTTON_BASE_CLASS,
  'border-ink bg-ink text-white hover:bg-ink-hover',
);

export const RETENTION_DANGER_BUTTON_CLASS = cn(
  BUTTON_BASE_CLASS,
  'border-error-line bg-white text-error hover:bg-error-bg',
);

export const RETENTION_SMALL_BUTTON_CLASS = 'min-h-11 px-3.5 text-[13px]';

export const RETENTION_BUTTON_ICON_CLASS = 'size-[18px] stroke-2';

export type TRetentionChipTone = 'ok' | 'info' | 'warn' | 'error' | 'neutral';

const CHIP_TONES: Record<TRetentionChipTone, string> = {
  ok: 'bg-success-bg text-success',
  info: 'bg-info-bg text-info',
  warn: 'bg-warning-bg text-warning',
  error: 'bg-error-bg text-error-strong',
  neutral: 'bg-surface-2 text-ink-soft',
};

export const getRetentionChipClass = (tone: TRetentionChipTone) =>
  cn(
    'inline-flex items-center gap-1.5 rounded-full px-[11px] py-1 text-xs font-bold whitespace-nowrap',
    CHIP_TONES[tone],
  );

export const RETENTION_LABEL_CLASS = 'grid gap-1.5 text-[13px] font-bold';

export const RETENTION_HINT_CLASS = 'font-medium text-ink-muted';

export const RETENTION_FIELD_CLASS =
  'h-[46px] w-full rounded-xl border-line-strong bg-white px-3.5 text-base font-medium text-ink shadow-none placeholder:text-ink-muted aria-invalid:border-error md:text-sm';

export const RETENTION_TEXTAREA_CLASS =
  'min-h-24 w-full resize-y rounded-xl border-line-strong bg-white px-3.5 py-3 text-base leading-normal font-medium text-ink shadow-none placeholder:text-ink-muted aria-invalid:border-error md:text-sm';

export const RETENTION_SELECT_CLASS =
  'w-full rounded-xl border-line-strong bg-white px-3.5 text-base font-medium text-ink shadow-none data-[placeholder]:text-ink-muted data-[size=default]:h-[46px] md:text-sm';

export const RETENTION_ERROR_CLASS = 'text-[13px] font-semibold text-error';

export const RETENTION_ALERT_CLASS =
  'rounded-[14px] bg-error-bg px-3.5 py-3 text-[13px] font-semibold text-error';

export const RETENTION_CHECK_CLASS =
  'flex min-h-11 cursor-pointer items-start gap-2.5 text-sm leading-[1.45]';

export const RETENTION_CHECK_INPUT_CLASS =
  'mt-0.5 size-5 shrink-0 cursor-pointer accent-brand disabled:cursor-not-allowed';

/** Aviso (`.nt`). */
export const RETENTION_NOTE_CLASS =
  'flex gap-3 rounded-2xl bg-surface px-4 py-3.5 text-sm leading-[1.45] text-ink-soft [&_b]:text-ink';

export const RETENTION_NOTE_ICON_CLASS = 'size-5 shrink-0 stroke-2';

/** Abas em pílula (`.tb`). */
export const RETENTION_SEGMENTED_CLASS =
  'flex flex-wrap gap-1.5 self-start rounded-[22px] bg-surface-2 p-1';

/** Rádio nativo escondido dentro do rótulo: setas do teclado já funcionam. */
export const RETENTION_SEGMENT_CLASS =
  'inline-flex min-h-10 cursor-pointer items-center rounded-full px-4 text-[13px] font-bold text-ink-muted transition-colors has-[:checked]:bg-white has-[:checked]:text-ink has-[:checked]:shadow-[0_2px_8px_rgba(15,12,30,0.1)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink';

/** O polegar padrão anda `100% - 2px`: com 24px, cabe certo na trilha de 48px. */
export const RETENTION_SWITCH_CLASS =
  'h-7 w-12 data-[state=checked]:bg-brand [&>span]:size-6';

export const RETENTION_TABLE_WRAP_CLASS =
  'overflow-x-auto rounded-[20px] border border-line bg-white';

export const RETENTION_TABLE_CLASS = 'w-full border-collapse text-sm';

export const RETENTION_TH_CLASS =
  'border-b border-line bg-surface px-4 py-3 text-left text-xs font-bold whitespace-nowrap text-ink-muted';

export const RETENTION_TD_CLASS =
  'border-b border-surface-3 px-4 py-3 align-middle [tr:last-child>&]:border-b-0';

export const RETENTION_NUMBER_CLASS =
  'text-right whitespace-nowrap tabular-nums';

export const RETENTION_DIALOG_CLASS = cn(
  PARTNER_PORTAL_CLASS,
  'max-h-[90dvh] gap-4 overflow-y-auto rounded-[24px] border-0 p-7 sm:max-w-[520px]',
  '[&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-surface-2 [&>button:last-child]:opacity-100',
);

export const RETENTION_DIALOG_TITLE_CLASS =
  'pr-10 text-left text-[22px] font-extrabold tracking-[-0.02em]';

export const RETENTION_DIALOG_ACTIONS_CLASS =
  'flex flex-wrap justify-end gap-2.5';

/** Barra de saldo e progresso. */
export const RETENTION_BAR_TRACK_CLASS =
  'h-2 overflow-hidden rounded-full bg-surface-3';

export const RETENTION_BAR_FILL_CLASS = 'h-2 rounded-full bg-brand';
