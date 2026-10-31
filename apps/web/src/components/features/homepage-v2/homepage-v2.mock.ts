import {
  Brush,
  Dumbbell,
  Flower2,
  HeartPulse,
  PawPrint,
  Scissors,
  Smile,
  Sparkles,
  SprayCan,
} from 'lucide-react';
import type {
  TExperienceRowConfig,
  TMarketplaceCategory,
} from './homepage-v2.types';

export const MARKETPLACE_CATEGORIES: TMarketplaceCategory[] = [
  { id: 'barbearias', label: 'Barbearias', query: 'Barbearia', icon: Scissors },
  {
    id: 'saloes',
    label: 'Salões de Beleza',
    query: 'Salão de Beleza',
    icon: Sparkles,
  },
  {
    id: 'spas',
    label: 'Spas & Massagens',
    query: 'Spa & Massagem',
    icon: Flower2,
  },
  {
    id: 'bem-estar',
    label: 'Bem-estar & Terapias',
    query: 'Bem-estar',
    icon: HeartPulse,
  },
  {
    id: 'faciais',
    label: 'Cuidados Faciais',
    query: 'Estética',
    icon: SprayCan,
  },
  {
    id: 'personal',
    label: 'Personal Trainers',
    query: 'Personal Trainer',
    icon: Dumbbell,
  },
  {
    id: 'manicure',
    label: 'Manicure & Pedicure',
    query: 'Manicure',
    icon: Brush,
  },
  {
    id: 'odonto',
    label: 'Odonto Estética',
    query: 'Odontologia',
    icon: Smile,
  },
  { id: 'pet', label: 'Pet Care & Banho', query: 'Pet Shop', icon: PawPrint },
];

export const EXPERIENCE_ROW_CONFIGS: TExperienceRowConfig[] = [
  {
    id: 'populares',
    title: 'Experiências e cuidados populares',
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
    title: 'Bem-estar para a semana',
    query: 'Bem-estar',
    category: 'Bem-estar',
    source: 'search',
  },
];

export const PARTNER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDnLMhfq8g8I4yekRj35IanA1UPKmFNoEswf70wslB0Dddei9wTkYPBWmBC65aRPQDJib2nm8XS3VMUH_KctexnPuPMGzH-ugeCSeacwnZ5fKuLEFnuC0b9_g0viuKjj3jbLNcAfTdGeW5Yt90dTZzR_ttWzKfQ_hmCgtMUrKGOSXiIdu7IbpC2aJAu4vZ9YXjOSqkQuvNhvbU4yk6wpGztiaFeZLcYRP108wbCilKj';
