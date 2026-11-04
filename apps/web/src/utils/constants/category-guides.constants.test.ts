import { slugify } from '@/utils/helpers/slug.helper';
import { describe, expect, it } from 'vitest';
import {
  CATEGORY_GUIDES,
  getCategoryGuide,
  getCategoryGuideByName,
} from './category-guides.constants';
import { PUBLIC_CATEGORY_NAMES } from './public-categories.constants';

describe('CATEGORY_GUIDES', () => {
  it.each(CATEGORY_GUIDES)('$slug usa o mesmo slug da busca', (guide) => {
    expect(PUBLIC_CATEGORY_NAMES).toContain(guide.name);
    expect(guide.slug).toBe(slugify(guide.name));
  });

  it.each(CATEGORY_GUIDES)(
    '$slug tem título e descrição no tamanho da busca',
    (guide) => {
      expect(guide.title.length).toBeLessThanOrEqual(65);
      expect(guide.description.length).toBeGreaterThanOrEqual(120);
      expect(guide.description.length).toBeLessThanOrEqual(160);
    },
  );

  it('não repete slug', () => {
    const slugs = CATEGORY_GUIDES.map((guide) => guide.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('encontra por slug e por nome', () => {
    expect(getCategoryGuide('barbearia')?.name).toBe('Barbearia');
    expect(getCategoryGuideByName('Salão de Beleza')?.slug).toBe(
      'salao-de-beleza',
    );
    expect(getCategoryGuide('yoga')).toBeUndefined();
  });
});
