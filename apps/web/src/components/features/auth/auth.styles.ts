export const AUTH_FOCUS_RING_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

export const AUTH_STEP_CLASS =
  'relative flex grow flex-col px-5 pt-8 pb-8 text-ink md:p-8';

export const AUTH_TITLE_CLASS =
  'text-[28px] leading-[1.12] font-extrabold tracking-[-0.03em]';

export const AUTH_SUBTITLE_CLASS =
  'mt-2.5 text-[15px] leading-[1.55] text-ink-muted';

export const AUTH_LABEL_CLASS = 'grid gap-[7px] text-sm font-semibold';

export const AUTH_INPUT_CLASS =
  'h-[52px] rounded-[14px] border-line-strong bg-white px-4 text-base font-medium text-ink shadow-none placeholder:text-ink-muted focus-visible:border-ink focus-visible:ring-ink/15 md:text-[15px]';

export const AUTH_PRIMARY_BUTTON_CLASS = `block h-[54px] w-full cursor-pointer rounded-full bg-ink text-[15px] font-bold text-white transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${AUTH_FOCUS_RING_CLASS}`;

export const AUTH_ICON_BUTTON_CLASS = `absolute top-3 flex size-11 cursor-pointer items-center justify-center rounded-full bg-surface-2 text-ink ${AUTH_FOCUS_RING_CLASS}`;

export const AUTH_LEGAL_CLASS = 'text-[13px] leading-[1.5] text-ink-muted';

/** O pseudo-elemento amplia a área de toque para 44px sem alterar a linha. */
export const AUTH_LINK_CLASS = `relative cursor-pointer underline after:absolute after:inset-x-0 after:-inset-y-3.5 after:content-[''] ${AUTH_FOCUS_RING_CLASS}`;
