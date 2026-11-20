import { Header } from '@nestjs/common';

/**
 * Cache na CDN da Vercel para GET públicos, iguais para qualquer visitante: a
 * CDN responde por 5 min sem invocar a função e, até 1 dia depois, entrega a
 * cópia antiga enquanto busca a nova em segundo plano. A Vercel tira o
 * `s-maxage` do que vai para o navegador. Nunca usar em resposta que dependa
 * de sessão: a chave do cache é só a URL.
 */
export const PUBLIC_CDN_CACHE_CONTROL =
  'public, s-maxage=300, stale-while-revalidate=86400';

export const PublicCdnCache = () =>
  Header('Cache-Control', PUBLIC_CDN_CACHE_CONTROL);
