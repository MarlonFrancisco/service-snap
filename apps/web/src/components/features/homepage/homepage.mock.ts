import type { TExperienceRowConfig } from './homepage.types';

export const EXPERIENCE_ROW_CONFIGS: TExperienceRowConfig[] = [
  {
    id: 'populares',
    title: 'Populares perto de você',
    query: 'serviços',
    source: 'popular',
  },
  {
    id: 'hoje',
    title: 'Com vaga ainda hoje',
    query: 'Barbearia',
    category: 'Barbearia',
    source: 'search',
  },
  {
    id: 'spas',
    title: 'Spas e massagens perto de você',
    query: 'Spa & Massagem',
    category: 'Spa & Massagem',
    source: 'search',
  },
  {
    id: 'saloes',
    title: 'Salões em alta nesta semana',
    query: 'Salão de Beleza',
    category: 'Salão de Beleza',
    source: 'search',
  },
  {
    id: 'bem-estar',
    title: 'Bem-estar perto de você',
    query: 'Bem-estar',
    category: 'Bem-estar',
    source: 'search',
  },
];

export const PARTNER_IMAGE =
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80';
