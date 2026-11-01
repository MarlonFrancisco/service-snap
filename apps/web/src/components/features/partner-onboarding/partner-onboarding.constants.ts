import { PUBLIC_CATEGORY_NAMES } from '@/utils/constants/public-categories.constants';
import type { TWorkingDays } from '@/types/api/stores.types';

export const FEATURED_BUSINESS_TYPES = [
  'Barbearia',
  'Salão de Beleza',
  'Spa & Massagem',
  'Estética',
  'Manicure',
  'Academia',
  'Yoga',
  'Pet Shop',
] as const;

export const ALL_BUSINESS_TYPES: readonly string[] = PUBLIC_CATEGORY_NAMES;

/** Só pontos de partida: o nome continua editável e o preço é do parceiro. */
export const SERVICE_SUGGESTIONS: Readonly<Record<string, readonly string[]>> = {
  Barbearia: ['Corte masculino', 'Barba', 'Corte e barba', 'Sobrancelha'],
  'Salão de Beleza': ['Corte feminino', 'Escova', 'Coloração', 'Hidratação'],
  'Spa & Massagem': [
    'Massagem relaxante',
    'Massagem modeladora',
    'Drenagem linfática',
    'Pedras quentes',
  ],
  Estética: ['Limpeza de pele', 'Design de sobrancelhas', 'Depilação', 'Peeling'],
  Manicure: ['Manicure', 'Pedicure', 'Manicure e pedicure', 'Esmaltação em gel'],
  Academia: ['Aula experimental', 'Avaliação física', 'Treino individual'],
  Yoga: ['Aula de yoga', 'Aula particular', 'Meditação guiada'],
  'Pet Shop': ['Banho', 'Tosa', 'Banho e tosa', 'Corte de unhas'],
};

export const WEEK_DAYS: readonly {
  id: keyof TWorkingDays;
  label: string;
}[] = [
  { id: 'monday', label: 'Seg' },
  { id: 'tuesday', label: 'Ter' },
  { id: 'wednesday', label: 'Qua' },
  { id: 'thursday', label: 'Qui' },
  { id: 'friday', label: 'Sex' },
  { id: 'saturday', label: 'Sáb' },
  { id: 'sunday', label: 'Dom' },
];

export const DEFAULT_BUSINESS_DAYS: TWorkingDays = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: false,
};

export const NEW_CATEGORY_VALUE = '__new__';
export const MAX_PHOTOS = 10;
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
