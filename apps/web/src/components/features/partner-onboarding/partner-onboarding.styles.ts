const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

export const ONBOARDING_FIELD_LABEL_CLASS =
  'grid gap-1.5 text-sm font-semibold text-[#0B0B0F]';

export const ONBOARDING_INPUT_CLASS = `h-[50px] w-full rounded-[14px] border border-[#E3E1EA] bg-white px-3.5 text-base font-medium text-[#0B0B0F] placeholder:text-[#6F6C7E] aria-invalid:border-[#B42318] md:text-[15px] ${FOCUS_RING}`;

/** DDI fixo ao lado do telefone: segue a altura e o raio dos campos. */
export const ONBOARDING_PHONE_CODE_CLASS =
  'flex h-[50px] shrink-0 items-center rounded-[14px] border border-[#E3E1EA] bg-[#F7F6FA] px-3.5 text-base font-medium tabular-nums text-[#0B0B0F] md:text-[15px]';

export const ONBOARDING_ERROR_CLASS = 'text-[13px] font-semibold text-[#B42318]';

export const ONBOARDING_HINT_CLASS = 'text-[13px] font-medium text-[#5F5C6E]';

export const ONBOARDING_BUTTON_CLASS = `min-h-[52px] cursor-pointer rounded-full border border-[#E3E1EA] bg-white px-[26px] text-[15px] font-bold text-[#0B0B0F] disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;

export const ONBOARDING_PRIMARY_BUTTON_CLASS = `min-h-[52px] cursor-pointer rounded-full border border-[#0B0B0F] bg-[#0B0B0F] px-[26px] text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;

export const ONBOARDING_OUTLINE_BUTTON_CLASS = `min-h-12 cursor-pointer rounded-full border border-[#0B0B0F] bg-white px-5 text-sm font-bold text-[#0B0B0F] disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;

export const ONBOARDING_CHIP_CLASS = `min-h-11 shrink-0 cursor-pointer rounded-full border border-[#E3E1EA] bg-white px-[15px] text-[13px] font-semibold text-[#0B0B0F] aria-pressed:border-2 aria-pressed:border-[#0B0B0F] aria-pressed:px-3.5 ${FOCUS_RING}`;

export const ONBOARDING_ICON_BUTTON_CLASS = `grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-[#F4F3F7] text-[17px] text-[#0B0B0F] ${FOCUS_RING}`;

export const ONBOARDING_COPY_BUTTON_CLASS = `min-h-11 shrink-0 cursor-pointer rounded-full border-0 bg-[#F4F3F7] px-[15px] text-[13px] font-bold text-[#0B0B0F] ${FOCUS_RING}`;

export const ONBOARDING_LINK_CLASS = `inline-flex min-h-11 items-center rounded-lg px-3.5 text-sm font-semibold text-[#0B0B0F] ${FOCUS_RING}`;
