import { describe, expect, it, vi } from 'vitest';
import {
  MIN_STORES_TO_INDEX,
  isIndexableCategoryCity,
  toCategoryCityLinks,
  toIndexableCategoryCityLinks,
} from './store-sitemap.helper';

vi.mock('@/service/search', () => ({ SearchService: {} }));

const sitemapWith = (
  categoryCities: { category: string; city: string; storeCount: number }[],
) => ({ stores: [], categoryCities });

describe('isIndexableCategoryCity', () => {
  it('usa o limite de 3 lojas', () => {
    expect(MIN_STORES_TO_INDEX).toBe(3);
    expect(isIndexableCategoryCity(0)).toBe(false);
    expect(isIndexableCategoryCity(2)).toBe(false);
    expect(isIndexableCategoryCity(3)).toBe(true);
  });
});

describe('toIndexableCategoryCityLinks', () => {
  it.each([
    [0, 0],
    [2, 0],
    [3, 1],
  ])('com %i lojas gera %i página', (storeCount, pages) => {
    const sitemap = sitemapWith([
      { category: 'Barbearia', city: 'Campinas', storeCount },
    ]);

    expect(toIndexableCategoryCityLinks(sitemap)).toHaveLength(pages);
  });

  it('soma as grafias da mesma cidade antes de aplicar o limite', () => {
    const sitemap = sitemapWith([
      { category: 'Barbearia', city: 'São Paulo', storeCount: 2 },
      { category: 'Barbearia', city: 'Sao Paulo', storeCount: 1 },
    ]);

    expect(toIndexableCategoryCityLinks(sitemap)).toEqual([
      expect.objectContaining({
        path: '/categoria/barbearia/sao-paulo',
        storeCount: 3,
      }),
    ]);
  });

  it('devolve lista vazia sem sitemap', () => {
    expect(toIndexableCategoryCityLinks(null)).toEqual([]);
  });
});

describe('toCategoryCityLinks', () => {
  it('mantém para os links internos as cidades abaixo do limite', () => {
    const sitemap = sitemapWith([
      { category: 'Barbearia', city: 'Campinas', storeCount: 1 },
      { category: 'Barbearia', city: 'Santos', storeCount: 0 },
    ]);

    expect(toCategoryCityLinks(sitemap).map((link) => link.path)).toEqual([
      '/categoria/barbearia/campinas',
    ]);
  });
});
