import {
  matchesCategory,
  normalizeSearchText,
  type TSearchHit,
} from '../../utils/helpers/search-relevance.helpers';
import type { TCategoryCitySitemapEntry } from './search.types';

const MAX_SITEMAP_CATEGORIES = 50;
const MAX_CATEGORY_LENGTH = 60;

/** `?categories=Barbearia,Salão de Beleza`: limita tamanho e quantidade. */
export const parseSitemapCategories = (value?: string): string[] => {
  if (!value) return [];

  const categories = value
    .split(',')
    .map((category) => category.trim())
    .filter(
      (category) => category && category.length <= MAX_CATEGORY_LENGTH,
    );

  return [...new Set(categories)].slice(0, MAX_SITEMAP_CATEGORIES);
};

/**
 * `updatedAt` entrou no índice depois; documento antigo usa `createdAt` até a
 * loja ser sincronizada de novo.
 */
export const sitemapUpdatedAt = (hit: TSearchHit): string | undefined => {
  const { updatedAt, createdAt } = hit.metadata ?? {};
  const value = updatedAt ?? createdAt;
  return typeof value === 'string' && value ? value : undefined;
};

/**
 * Agrupa as lojas por categoria + cidade com o mesmo `matchesCategory` da busca,
 * para o sitemap só listar páginas `/categoria/x/cidade` que mostram lojas.
 */
export const buildCategoryCitySitemap = (
  hits: TSearchHit[],
  categories: string[],
): TCategoryCitySitemapEntry[] => {
  const groups = new Map<string, TCategoryCitySitemapEntry>();

  for (const hit of hits) {
    const city = hit.content?.city?.trim();
    const cityKey = normalizeSearchText(city || '');
    if (!city || !cityKey) continue;

    const updatedAt = sitemapUpdatedAt(hit);

    for (const category of categories) {
      if (!matchesCategory(hit, category)) continue;

      const key = `${normalizeSearchText(category)}|${cityKey}`;
      const group = groups.get(key);

      if (!group) {
        groups.set(key, { category, city, storeCount: 1, updatedAt });
        continue;
      }

      group.storeCount += 1;
      if (updatedAt && (!group.updatedAt || updatedAt > group.updatedAt)) {
        group.updatedAt = updatedAt;
      }
    }
  }

  return [...groups.values()];
};
