/** Offset só com a barra do logo (sem category rail). */
export const HEADER_OFFSET_BARE_CLASS = 'pt-16 md:pt-20';

/**
 * Offset do conteúdo sob o header (logo + categorias).
 * Header real ~152px mobile / ~173px desktop — folga de ~16–24px abaixo.
 */
export const HEADER_OFFSET_CLASS = 'pt-[10.5rem] md:pt-[12.5rem]';

/**
 * Busca fica na barra do logo (centro). Mesma altura do header com categorias.
 * Mantido como alias para callers existentes (`showSearchBar`).
 */
export const HEADER_OFFSET_WITH_SEARCH_CLASS = HEADER_OFFSET_CLASS;

/** Sticky top alinhado ao header com categorias (logo + rail). */
export const HEADER_STICKY_TOP_CLASS = 'top-[10.5rem] md:top-[12.5rem]';