import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PRIMARY_ACTION_CLASS,
} from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';

const DISABLED_CLASS = 'disabled:cursor-not-allowed disabled:opacity-50';

const SECONDARY_BASE_CLASS = cn(
  'flex items-center justify-center rounded-full border border-[#E3E1EA] bg-white text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA]',
  PARTNER_FOCUS_CLASS,
  DISABLED_CLASS,
);

export const STORES_PRIMARY_BUTTON_CLASS = cn(
  PARTNER_PRIMARY_ACTION_CLASS,
  'min-h-12 gap-2 px-[22px] text-sm',
  DISABLED_CLASS,
);

export const STORES_SECONDARY_BUTTON_CLASS = cn(
  SECONDARY_BASE_CLASS,
  'min-h-12 gap-2 px-[22px] text-sm font-bold',
);

export const STORES_COMPACT_PRIMARY_BUTTON_CLASS = cn(
  PARTNER_PRIMARY_ACTION_CLASS,
  'gap-1.5',
  DISABLED_CLASS,
);

export const STORES_COMPACT_BUTTON_CLASS = cn(
  SECONDARY_BASE_CLASS,
  'min-h-11 gap-1.5 px-4 text-[13px] font-semibold',
);

export const STORES_DANGER_TEXT_CLASS = 'text-[#A4231A] hover:bg-[#FBE8E6]';

export const STORES_DIALOG_CLOSE_CLASS =
  '[&>button]:top-3.5 [&>button]:right-3.5 [&>button]:grid [&>button]:size-11 [&>button]:place-items-center [&>button]:rounded-full [&>button]:bg-[#F4F3F7] [&>button]:opacity-100';

export const STORES_DRAWER_CLASS =
  'rounded-t-[28px] bg-white data-[vaul-drawer-direction=bottom]:max-h-[95dvh]';

export const STORES_FIELD_CLASS =
  'h-[50px] rounded-[14px] border-[#E3E1EA] bg-white px-3.5 text-[15px] font-medium text-[#0B0B0F] shadow-none placeholder:text-[#6F6C7E] md:text-[15px]';

export const STORES_SELECT_TRIGGER_CLASS = cn(
  STORES_FIELD_CLASS,
  'w-full data-[size=default]:h-[50px]',
);

export const STORES_TEXTAREA_CLASS =
  'min-h-[88px] resize-none rounded-[14px] border-[#E3E1EA] bg-white px-3.5 py-3 text-[15px] font-medium text-[#0B0B0F] shadow-none placeholder:text-[#6F6C7E] md:text-[15px]';

export const STORES_FIELDSET_CLASS = 'm-0 grid min-w-0 gap-3 border-0 p-0';

export const STORES_LEGEND_CLASS =
  'mb-2.5 p-0 text-[13px] font-bold tracking-[0.06em] text-[#5F5C6E] uppercase';

export const STORES_LABEL_CLASS = 'text-sm font-semibold';

export const STORES_HINT_CLASS = 'text-xs font-medium text-[#5F5C6E]';

export const STORES_TAB_PANEL_CLASS = 'mt-0 grid content-start gap-5';

export const STORES_TWO_COLUMNS_CLASS = 'grid grid-cols-1 gap-3 md:grid-cols-2';

export const STORES_CHIP_CLASS =
  'inline-flex min-h-11 items-center gap-1 rounded-full bg-[#F4F3F7] py-1 pr-1 pl-3.5 text-[13px] font-semibold text-[#0B0B0F]';

export const STORES_CHIP_REMOVE_CLASS = cn(
  'grid size-9 place-items-center rounded-full transition-colors hover:bg-[#E3E1EA]',
  PARTNER_FOCUS_CLASS,
);

export const STORES_ERROR_TEXT_CLASS =
  'rounded-[14px] bg-[#FBE8E6] px-3.5 py-3 text-sm font-medium text-[#A4231A]';
