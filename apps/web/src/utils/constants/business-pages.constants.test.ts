import { describe, expect, it } from 'vitest';
import {
  BUSINESS_HUB,
  BUSINESS_SEGMENTS,
  businessPagePath,
  getBusinessSegment,
} from './business-pages.constants';
import { getCategoryGuide } from './category-guides.constants';

const ALL_PAGES = [BUSINESS_HUB, ...BUSINESS_SEGMENTS];

describe('páginas para negócios', () => {
  it.each(ALL_PAGES)(
    '"$heading" tem título e descrição no tamanho da busca',
    (page) => {
      expect(page.title.length).toBeLessThanOrEqual(65);
      expect(page.description.length).toBeGreaterThanOrEqual(120);
      expect(page.description.length).toBeLessThanOrEqual(160);
    },
  );

  it.each(BUSINESS_SEGMENTS)(
    '$slug tem a categoria correspondente',
    (segment) => {
      // A página da categoria aponta para o segmento com o mesmo slug.
      expect(getCategoryGuide(segment.slug)).toBeDefined();
    },
  );

  it('monta os caminhos', () => {
    expect(businessPagePath('')).toBe('/sistema-de-agendamento');
    expect(businessPagePath('barbearia')).toBe(
      '/sistema-de-agendamento/barbearia',
    );
    expect(getBusinessSegment('yoga')).toBeUndefined();
  });
});
