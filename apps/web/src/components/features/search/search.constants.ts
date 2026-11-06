import type { Service } from './search.types';

export const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Salão Elegance',
    category: 'Salão de Beleza',
    rating: 4.8,
    reviewCount: 127,
    location: 'São Paulo, SP',
    price: 'R$ 80',
    imageUrl:
      'https://images.unsplash.com/photo-1750263160581-d332256293bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzYWxvbiUyMG1vZGVybnxlbnwxfHx8fDE3NTk0MDUxMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description:
      'Salão especializado em tratamentos capilares e estéticos com profissionais altamente qualificados.',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - Jardim Paulista',
    isFavorite: false,
    nextSlot: 'Hoje 14:30',
  },
  {
    id: '2',
    name: 'Barbearia Classic',
    category: 'Barbearia',
    rating: 4.6,
    reviewCount: 89,
    location: 'São Paulo, SP',
    price: 'R$ 45',
    imageUrl:
      'https://images.unsplash.com/photo-1667539916609-c706d5b7ed65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJiZXJzaG9wJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU5MzQ0MTYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description:
      'Barbearia tradicional com cortes clássicos e modernos, oferecendo experiência completa de cuidados masculinos.',
    phone: '(11) 88888-8888',
    address: 'Av. Paulista, 456 - Bela Vista',
    isFavorite: true,
    nextSlot: 'Amanhã 09:00',
  },
  {
    id: '3',
    name: 'Spa Wellness',
    category: 'Spa',
    rating: 4.9,
    reviewCount: 156,
    location: 'São Paulo, SP',
    price: 'R$ 120',
    imageUrl:
      'https://images.unsplash.com/photo-1737352777897-e22953991a32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBtYXNzYWdlJTIwdGhlcmFweXxlbnwxfHx8fDE3NTkzMjkxMTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description:
      'Spa completo com massagens terapêuticas e tratamentos de bem-estar em ambiente acolhedor.',
    phone: '(11) 77777-7777',
    address: 'Rua Augusta, 789 - Consolação',
    isFavorite: false,
    nextSlot: 'Hoje 16:00',
  },
  {
    id: '4',
    name: 'Nail Studio',
    category: 'Manicure',
    rating: 4.7,
    reviewCount: 94,
    location: 'São Paulo, SP',
    price: 'R$ 35',
    imageUrl:
      'https://images.unsplash.com/photo-1613457492120-4fcfbb7c3a5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwc2Fsb24lMjBtYW5pY3VyZXxlbnwxfHx8fDE3NTkzMzUyNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description:
      'Studio especializado em nail art e cuidados com as unhas, com técnicas modernas e produtos de qualidade.',
    phone: '(11) 66666-6666',
    address: 'Rua Oscar Freire, 321 - Jardins',
    isFavorite: false,
    nextSlot: 'Hoje 15:00',
  },
];

export const SERVICE_CATEGORIES = [
  'Salão de Beleza',
  'Barbearia',
  'Spa & Massagem',
  'Odontologia',
  'Personal Trainer',
  'Estética',
] as const;

export const LOCATIONS = [
  { value: '', label: 'Todas as localidades' },
  { value: 'sao-paulo', label: 'São Paulo, SP' },
  { value: 'rio-janeiro', label: 'Rio de Janeiro, RJ' },
  { value: 'belo-horizonte', label: 'Belo Horizonte, MG' },
  { value: 'porto-alegre', label: 'Porto Alegre, RS' },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: 'any', label: 'Qualquer horário' },
  { value: 'today', label: 'Hoje' },
  { value: 'tomorrow', label: 'Amanhã' },
  { value: 'weekend', label: 'Este fim de semana' },
] as const;

export const RATING_OPTIONS = [
  { value: '0', label: 'Todas as avaliações' },
  { value: '3', label: '3+ estrelas' },
  { value: '4', label: '4+ estrelas' },
  { value: '4.5', label: '4.5+ estrelas' },
] as const;

export const PRICE_RANGE_LIMITS = {
  min: 0,
  max: 500,
  step: 10,
} as const;

/** Nome da lista de resultados nos eventos `view_item_list` e `select_item`. */
export const SEARCH_LIST_NAME = 'search';
