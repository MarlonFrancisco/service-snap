/** Shared public positioning — keep legal/marketing pages aligned. */
export const PLATFORM_DESCRIPTION =
  'marketplace brasileiro de agendamento online que conecta clientes a prestadores de serviços locais — de beleza e bem-estar a saúde, educação, oficinas, consultorias e outros';

export const PLATFORM_SCOPE_SHORT =
  'prestadores de serviços locais (salões, clínicas, consultorias, oficinas e outros)';

/** On-page “Última atualização” for legal pages — keep sitemap lastmod in sync. */
export const LEGAL_PAGES_UPDATED_AT = new Date('2026-11-12T00:00:00.000Z');

/**
 * `lastmod` do sitemap para home, páginas institucionais, categorias e
 * páginas para negócios. Atualize quando o texto dessas páginas mudar: o Google
 * ignora o lastmod de sites em que ele muda sem o conteúdo mudar.
 */
export const MARKETING_PAGES_UPDATED_AT = new Date('2026-11-05T00:00:00.000Z');
