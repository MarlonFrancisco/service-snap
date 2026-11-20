const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

export const ONBOARDING_FIELD_LABEL_CLASS =
  'grid gap-1.5 text-sm font-semibold text-ink';

export const ONBOARDING_INPUT_CLASS = `h-[50px] w-full rounded-[14px] border border-line-strong bg-white px-3.5 text-base font-medium text-ink placeholder:text-ink-muted aria-invalid:border-error md:text-[15px] ${FOCUS_RING}`;

/** DDI fixo ao lado do telefone: segue a altura e o raio dos campos. */
export const ONBOARDING_PHONE_CODE_CLASS =
  'flex h-[50px] shrink-0 items-center rounded-[14px] border border-line-strong bg-surface px-3.5 text-base font-medium tabular-nums text-ink md:text-[15px]';

export const ONBOARDING_ERROR_CLASS = 'text-[13px] font-semibold text-error';

export const ONBOARDING_HINT_CLASS = 'text-[13px] font-medium text-ink-muted';

export const ONBOARDING_BUTTON_CLASS = `min-h-[52px] cursor-pointer rounded-full border border-line-strong bg-white px-[26px] text-[15px] font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;

export const ONBOARDING_PRIMARY_BUTTON_CLASS = `min-h-[52px] cursor-pointer rounded-full border border-ink bg-ink px-[26px] text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;

export const ONBOARDING_OUTLINE_BUTTON_CLASS = `min-h-12 cursor-pointer rounded-full border border-ink bg-white px-5 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;

export const ONBOARDING_CHIP_CLASS = `min-h-11 shrink-0 cursor-pointer rounded-full border border-line-strong bg-white px-[15px] text-[13px] font-semibold text-ink aria-pressed:border-2 aria-pressed:border-ink aria-pressed:px-3.5 ${FOCUS_RING}`;

export const ONBOARDING_ICON_BUTTON_CLASS = `grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface-2 text-[17px] text-ink ${FOCUS_RING}`;

export const ONBOARDING_COPY_BUTTON_CLASS = `min-h-11 shrink-0 cursor-pointer rounded-full border-0 bg-surface-2 px-[15px] text-[13px] font-bold text-ink ${FOCUS_RING}`;

export const ONBOARDING_LINK_CLASS = `inline-flex min-h-11 items-center rounded-lg px-3.5 text-sm font-semibold text-ink ${FOCUS_RING}`;
