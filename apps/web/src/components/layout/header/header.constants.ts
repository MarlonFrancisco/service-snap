/** Offset exato da altura do header (64px mobile / 80px desktop). */
export const HEADER_OFFSET_BARE_CLASS = 'pt-16 md:pt-20';

/** Offset do conteúdo sob o header, com 16px de folga. */
export const HEADER_OFFSET_CLASS = 'pt-20 md:pt-24';

/** Sticky top alinhado ao offset do conteúdo. */
export const HEADER_STICKY_TOP_CLASS = 'top-20 md:top-24';

/** Posição da busca no centro do header, igual em todas as views. */
export const HEADER_SEARCH_SLOT_CLASS =
  'absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block md:w-[320px] lg:w-[420px]';

/** Formato da busca do header (campo real ou atalho compacto). */
export const HEADER_SEARCH_FIELD_CLASS =
  'flex h-12 w-full items-center rounded-full border bg-white pr-1.5 pl-[22px] text-sm font-medium shadow-[0_4px_16px_rgba(15,12,30,0.08)]';

/** Botão circular da busca do header. */
export const HEADER_SEARCH_ICON_CLASS =
  'grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0B0B0F] text-white';
