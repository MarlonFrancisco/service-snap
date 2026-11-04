import { describe, expect, it } from 'vitest';
import {
  categoryCityPath,
  labelFromSlug,
  resolveCategoryCity,
} from './category-city.helper';

describe('labelFromSlug', () => {
  it('deixa preposições minúsculas no meio do nome', () => {
    expect(labelFromSlug('rio-de-janeiro')).toBe('Rio de Janeiro');
    expect(labelFromSlug('sao-jose-dos-campos')).toBe('Sao Jose dos Campos');
    expect(labelFromSlug('campinas')).toBe('Campinas');
  });
});

describe('resolveCategoryCity', () => {
  it('resolve categoria pública e cidade válida', () => {
    expect(resolveCategoryCity('barbearia', 'sao-paulo')).toMatchObject({
      categoryName: 'Barbearia',
      citySlug: 'sao-paulo',
      cityLabel: 'Sao Paulo',
    });
  });

  it('recusa categoria desconhecida', () => {
    expect(resolveCategoryCity('xyz', 'sao-paulo')).toBeNull();
  });

  it('monta o caminho', () => {
    expect(categoryCityPath('barbearia', 'sao-paulo')).toBe(
      '/categoria/barbearia/sao-paulo',
    );
  });
});
