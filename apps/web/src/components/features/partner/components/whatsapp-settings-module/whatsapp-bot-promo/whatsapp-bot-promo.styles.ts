import { cn } from '@repo/ui';
import { PARTNER_FOCUS_CLASS } from '../../../partner.styles';
import { MODULE_ACTION_CLASS } from '../../notifications-module/notifications-module.styles';

/** Botões de contorno do desenho de divulgação (46px, 14px). */
export const WHATSAPP_BOT_ACTION_CLASS = cn(
  MODULE_ACTION_CLASS,
  'min-h-[46px] px-[18px] text-sm',
);

/** Campo do link em pílula, com o botão de copiar embutido. */
export const WHATSAPP_BOT_LINK_FIELD_CLASS =
  'flex items-center gap-2 rounded-full border border-[#E3E1EA] py-1.5 pr-1.5 pl-4 text-sm text-[#5F5C6E]';

export const WHATSAPP_BOT_COPY_BUTTON_CLASS = cn(
  'min-h-11 shrink-0 cursor-pointer rounded-full border-0 bg-[#F4F3F7] px-[15px] text-[13px] font-bold text-[#0B0B0F] transition-colors hover:bg-[#EBE9F0]',
  PARTNER_FOCUS_CLASS,
);

export const WHATSAPP_BOT_TIP_CLASS =
  'text-[13px] leading-normal text-[#5F5C6E]';
