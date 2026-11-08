import { SearchService } from '@/service/search';
import type { TStoresSitemap } from '@/types/api/search.types';
import { PUBLIC_CATEGORY_NAMES } from '@/utils/constants/public-categories.constants';
import {
  categoryCityPath,
  resolveCategoryCity,
} from '@/utils/helpers/category-city.helper';
import { withBudget } from '@/utils/helpers/promise.helper';
import { slugify } from '@/utils/helpers/slug.helper';
import { cache } from 'react';

const SITEMAP_MS = 8000;

/** Abaixo disso a página categoria + cidade fica rasa demais para o índice. */
export const MIN_STORES_PER_CATEGORY_CITY = 1;

export type TCategoryCityLink = {
  categoryName: string;
  categorySlug: string;
  cityName: string;
  path: string;
  storeCount: number;
  updatedAt?: string;
};

/** `null` quando a API falha ou demora: quem chama segue só com o conteúdo fixo. */
export const loadStoreSitemap = cache(
  async (): Promise<TStoresSitemap | null> =>
    (await withBudget(
      SearchService.getSitemap(PUBLIC_CATEGORY_NAMES),
      SITEMAP_MS,
    )) ?? null,
);

/**
 * Converte os pares da API em páginas `/categoria/x/cidade` válidas, sem repetir
 * a mesma URL quando duas grafias da cidade viram o mesmo slug.
 */
export function toCategoryCityLinks(
  sitemap: TStoresSitemap | null,
): TCategoryCityLink[] {
  const links = new Map<string, TCategoryCityLink>();

  for (const entry of sitemap?.categoryCities ?? []) {
    if (entry.storeCount < MIN_STORES_PER_CATEGORY_CITY) continue;

    const resolved = resolveCategoryCity(
      slugify(entry.category),
      slugify(entry.city),
    );
    if (!resolved) continue;

    const path = categoryCityPath(resolved.categorySlug, resolved.citySlug);
    const current = links.get(path);

    if (current) {
      current.storeCount += entry.storeCount;
      if (
        entry.updatedAt &&
        (!current.updatedAt || entry.updatedAt > current.updatedAt)
      ) {
        current.updatedAt = entry.updatedAt;
      }
      continue;
    }

    links.set(path, {
      categoryName: resolved.categoryName,
      categorySlug: resolved.categorySlug,
      cityName: entry.city,
      path,
      storeCount: entry.storeCount,
      updatedAt: entry.updatedAt,
    });
  }

  return [...links.values()];
}

/** Data inválida ou ausente vira `undefined`: sem `lastmod` é melhor que um errado. */
export function toLastModified(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Cidades de uma categoria, das com mais lojas para as com menos. */
export function categoryCityLinksFor(
  links: TCategoryCityLink[],
  categorySlug: string,
): TCategoryCityLink[] {
  return links
    .filter((link) => link.categorySlug === categorySlug)
    .sort(
      (a, b) =>
        b.storeCount - a.storeCount ||
        a.cityName.localeCompare(b.cityName, 'pt-BR'),
    );
}
