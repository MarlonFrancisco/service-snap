import { describe, expect, it } from 'vitest';
import {
  filterAndRankSearchHits,
  matchesCategory,
  matchesLocation,
  parseSearchIntent,
  type TSearchHit,
} from './search-relevance.helpers';

const hit = (partial: Partial<TSearchHit> & { id: string }): TSearchHit => ({
  score: 1,
  content: {
    name: 'Loja',
    city: 'São Paulo',
    state: 'SP',
    categoryNames: ['Barbearia'],
    serviceNames: ['Corte masculino'],
    ...partial.content,
  },
  ...partial,
});

describe('parseSearchIntent', () => {
  it('extracts location from "em ..." phrases', () => {
    const intent = parseSearchIntent('barbearia em Pinheiros');
    expect(intent.location).toBe('pinheiros');
    expect(intent.category).toBe('barbearia');
    expect(intent.searchQuery.toLowerCase()).toContain('barbearia');
  });

  it('respects explicit category and location options', () => {
    const intent = parseSearchIntent('qualquer coisa', {
      category: 'Manicure',
      location: 'Curitiba',
    });
    expect(intent.category).toBe('manicure');
    expect(intent.location).toBe('curitiba');
  });

  it('strips noise words like perto de mim', () => {
    const intent = parseSearchIntent('manicure perto de mim hoje');
    expect(intent.category).toBe('manicure');
    expect(intent.searchQuery.toLowerCase()).not.toContain('hoje');
    expect(intent.searchQuery.toLowerCase()).not.toContain('perto de mim');
  });
});

describe('matchesCategory / matchesLocation', () => {
  it('matches category aliases on services', () => {
    const store = hit({
      id: '1',
      content: {
        name: 'Studio X',
        categoryNames: [],
        serviceNames: ['Barba e cabelo'],
      },
    });
    expect(matchesCategory(store, 'barbearia')).toBe(true);
  });

  it('matches city location', () => {
    const store = hit({
      id: '2',
      content: { city: 'Curitiba', state: 'PR' },
    });
    expect(matchesLocation(store, 'curitiba')).toBe(true);
    expect(matchesLocation(store, 'pinheiros')).toBe(false);
  });
});

describe('filterAndRankSearchHits', () => {
  it('drops irrelevant category hits instead of returning them', () => {
    const hits = [
      hit({
        id: 'cafe',
        score: 10,
        content: {
          name: 'Café Central',
          categoryNames: ['Cafeteria'],
          serviceNames: ['Café'],
          city: 'São Paulo',
        },
      }),
      hit({
        id: 'barber',
        score: 3,
        content: {
          name: 'Barbearia Norte',
          categoryNames: ['Barbearia'],
          serviceNames: ['Corte'],
          city: 'São Paulo',
        },
      }),
    ];

    const ranked = filterAndRankSearchHits(hits, parseSearchIntent('Barbearia'));
    expect(ranked.map((item) => item.id)).toEqual(['barber']);
  });

  it('returns empty when nothing matches the category constraint', () => {
    const hits = [
      hit({
        id: 'cafe',
        content: {
          name: 'Café Central',
          categoryNames: ['Cafeteria'],
          serviceNames: [],
        },
      }),
    ];

    const ranked = filterAndRankSearchHits(hits, parseSearchIntent('Barbearia'));
    expect(ranked).toEqual([]);
  });
});
