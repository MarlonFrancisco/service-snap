export const AVAILABLE_COLORS = [
  'blue',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
  'green',
  'gray',
] as const;

export type TCategoryColor = (typeof AVAILABLE_COLORS)[number];

type TCategoryColorOption = {
  label: string;
  swatchClass: string;
};

const CATEGORY_COLORS: Record<TCategoryColor, TCategoryColorOption> = {
  blue: { label: 'Azul', swatchClass: 'bg-[#2563EB]' },
  purple: { label: 'Roxo', swatchClass: 'bg-[#7C3AED]' },
  pink: { label: 'Rosa', swatchClass: 'bg-[#DB2777]' },
  red: { label: 'Vermelho', swatchClass: 'bg-[#DC2626]' },
  orange: { label: 'Laranja', swatchClass: 'bg-[#C2410C]' },
  yellow: { label: 'Amarelo', swatchClass: 'bg-[#A16207]' },
  green: { label: 'Verde', swatchClass: 'bg-[#047857]' },
  gray: { label: 'Cinza', swatchClass: 'bg-[#6B7280]' },
};

export const DEFAULT_CATEGORY_COLOR: TCategoryColor = 'blue';

export const isCategoryColor = (color?: string): color is TCategoryColor =>
  AVAILABLE_COLORS.some((availableColor) => availableColor === color);

export const getCategoryColor = (color?: string): TCategoryColorOption =>
  CATEGORY_COLORS[isCategoryColor(color) ? color : DEFAULT_CATEGORY_COLOR];
