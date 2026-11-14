import type { TExperienceRowConfig } from './homepage.types';

export const EXPERIENCE_ROW_CONFIGS: TExperienceRowConfig[] = [
  {
    id: 'populares',
    title: 'Populares no ServiceSnap',
    query: 'serviços',
    source: 'popular',
  },
  {
    id: 'hoje',
    title: 'Barbearias',
    query: 'Barbearia',
    category: 'Barbearia',
    source: 'search',
  },
  {
    id: 'spas',
    title: 'Spas e massagens',
    query: 'Spa & Massagem',
    category: 'Spa & Massagem',
    source: 'search',
  },
  {
    id: 'saloes',
    title: 'Salões de beleza',
    query: 'Salão de Beleza',
    category: 'Salão de Beleza',
    source: 'search',
  },
  {
    id: 'bem-estar',
    title: 'Bem-estar',
    query: 'Bem-estar',
    category: 'Bem-estar',
    source: 'search',
  },
];
