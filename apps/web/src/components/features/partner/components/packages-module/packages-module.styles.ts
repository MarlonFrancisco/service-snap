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
  'text-2xl font-extrabold tracking-[-0.025em] text-[#0B0B0F]';

export const RETENTION_LEAD_CLASS =
  'mt-0.5 text-sm leading-normal text-[#5F5C6E]';

export const RETENTION_CAPTION_CLASS =
  'text-[13px] font-bold tracking-[0.06em] text-[#5F5C6E] uppercase';

/** Cartão elevado do desenho (`.cd`). */
export const RETENTION_CARD_CLASS =
  'flex min-w-0 flex-col gap-4 rounded-[24px] bg-white p-6 shadow-[0_12px_40px_rgba(15,12,30,0.1)]';

export const RETENTION_CARD_TITLE_CLASS =
  'text-xl font-extrabold tracking-[-0.02em] break-words';

export const RETENTION_SUBTITLE_CLASS = 'text-base font-extrabold';

export const RETENTION_TEXT_CLASS = 'text-sm leading-normal text-[#5F5C6E]';

/** Linha de item (`.it`). */
export const RETENTION_ITEM_CLASS =
  'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EBE9F0] px-4 py-3.5';

export const RETENTION_ITEM_LINES_CLASS =
  'flex min-w-0 flex-col gap-0.5 [&>b]:text-sm [&>b]:break-words [&>span]:text-[13px] [&>span]:text-[#5F5C6E]';

const BUTTON_BASE_CLASS = cn(
  'inline-flex min-h-[46px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border px-[18px] text-sm font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60',
  PARTNER_FOCUS_CLASS,
);

export const RETENTION_BUTTON_CLASS = cn(
  BUTTON_BASE_CLASS,
  'border-[#E3E1EA] bg-white text-[#0B0B0F] hover:bg-[#F7F6FA]',
);

export const RETENTION_PRIMARY_BUTTON_CLASS = cn(
  BUTTON_BASE_CLASS,
  'border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]',
);

export const RETENTION_DANGER_BUTTON_CLASS = cn(
  BUTTON_BASE_CLASS,
  'border-[#F3C9C4] bg-white text-[#A1281A] hover:bg-[#FBE8E6]',
);

export const RETENTION_SMALL_BUTTON_CLASS = 'min-h-11 px-3.5 text-[13px]';

export const RETENTION_BUTTON_ICON_CLASS = 'size-[18px] stroke-2';

export type TRetentionChipTone = 'ok' | 'info' | 'warn' | 'error' | 'neutral';

const CHIP_TONES: Record<TRetentionChipTone, string> = {
  ok: 'bg-[#DFF2E7] text-[#0A5536]',
  info: 'bg-[#E4ECF6] text-[#143C66]',
  warn: 'bg-[#FBE8D9] text-[#7A3A07]',
  error: 'bg-[#FBE4E1] text-[#8F2416]',
  neutral: 'bg-[#F4F3F7] text-[#3D3A4A]',
};

export const getRetentionChipClass = (tone: TRetentionChipTone) =>
  cn(
    'inline-flex items-center gap-1.5 rounded-full px-[11px] py-1 text-xs font-bold whitespace-nowrap',
    CHIP_TONES[tone],
  );

export const RETENTION_LABEL_CLASS = 'grid gap-1.5 text-[13px] font-bold';

export const RETENTION_HINT_CLASS = 'font-medium text-[#5F5C6E]';

export const RETENTION_FIELD_CLASS =
  'h-[46px] w-full rounded-xl border-[#E3E1EA] bg-white px-3.5 text-base font-medium text-[#0B0B0F] shadow-none placeholder:text-[#6F6C7E] aria-invalid:border-[#A4231A] md:text-sm';

export const RETENTION_TEXTAREA_CLASS =
  'min-h-24 w-full resize-y rounded-xl border-[#E3E1EA] bg-white px-3.5 py-3 text-base leading-normal font-medium text-[#0B0B0F] shadow-none placeholder:text-[#6F6C7E] aria-invalid:border-[#A4231A] md:text-sm';

export const RETENTION_SELECT_CLASS =
  'w-full rounded-xl border-[#E3E1EA] bg-white px-3.5 text-base font-medium text-[#0B0B0F] shadow-none data-[placeholder]:text-[#6F6C7E] data-[size=default]:h-[46px] md:text-sm';

export const RETENTION_ERROR_CLASS = 'text-[13px] font-semibold text-[#A4231A]';

export const RETENTION_ALERT_CLASS =
  'rounded-[14px] bg-[#FBE8E6] px-3.5 py-3 text-[13px] font-semibold text-[#A4231A]';

export const RETENTION_CHECK_CLASS =
  'flex min-h-11 cursor-pointer items-start gap-2.5 text-sm leading-[1.45]';

export const RETENTION_CHECK_INPUT_CLASS =
  'mt-0.5 size-5 shrink-0 cursor-pointer accent-[#9810FA] disabled:cursor-not-allowed';

/** Aviso (`.nt`). */
export const RETENTION_NOTE_CLASS =
  'flex gap-3 rounded-2xl bg-[#F7F6FA] px-4 py-3.5 text-sm leading-[1.45] text-[#3D3A4A] [&_b]:text-[#0B0B0F]';

export const RETENTION_NOTE_ICON_CLASS = 'size-5 shrink-0 stroke-2';

/** Abas em pílula (`.tb`). */
export const RETENTION_SEGMENTED_CLASS =
  'flex flex-wrap gap-1.5 self-start rounded-[22px] bg-[#F4F3F7] p-1';

/** Rádio nativo escondido dentro do rótulo: setas do teclado já funcionam. */
export const RETENTION_SEGMENT_CLASS =
  'inline-flex min-h-10 cursor-pointer items-center rounded-full px-4 text-[13px] font-bold text-[#5F5C6E] transition-colors has-[:checked]:bg-white has-[:checked]:text-[#0B0B0F] has-[:checked]:shadow-[0_2px_8px_rgba(15,12,30,0.1)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#0B0B0F]';

/** O polegar padrão anda `100% - 2px`: com 24px, cabe certo na trilha de 48px. */
export const RETENTION_SWITCH_CLASS =
  'h-7 w-12 data-[state=checked]:bg-[#9810FA] [&>span]:size-6';

export const RETENTION_TABLE_WRAP_CLASS =
  'overflow-x-auto rounded-[20px] border border-[#EBE9F0] bg-white';

export const RETENTION_TABLE_CLASS = 'w-full border-collapse text-sm';

export const RETENTION_TH_CLASS =
  'border-b border-[#EBE9F0] bg-[#F7F6FA] px-4 py-3 text-left text-xs font-bold whitespace-nowrap text-[#5F5C6E]';

export const RETENTION_TD_CLASS =
  'border-b border-[#F0EEF4] px-4 py-3 align-middle [tr:last-child>&]:border-b-0';

export const RETENTION_NUMBER_CLASS =
  'text-right whitespace-nowrap tabular-nums';

export const RETENTION_DIALOG_CLASS = cn(
  PARTNER_PORTAL_CLASS,
  'max-h-[90dvh] gap-4 overflow-y-auto rounded-[24px] border-0 p-7 sm:max-w-[520px]',
  '[&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-[#F4F3F7] [&>button:last-child]:opacity-100',
);

export const RETENTION_DIALOG_TITLE_CLASS =
  'pr-10 text-left text-[22px] font-extrabold tracking-[-0.02em]';

export const RETENTION_DIALOG_ACTIONS_CLASS =
  'flex flex-wrap justify-end gap-2.5';

/** Barra de saldo e progresso. */
export const RETENTION_BAR_TRACK_CLASS =
  'h-2 overflow-hidden rounded-full bg-[#F0EEF4]';

export const RETENTION_BAR_FILL_CLASS = 'h-2 rounded-full bg-[#9810FA]';
