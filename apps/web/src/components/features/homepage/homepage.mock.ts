import { PUBLIC_CATEGORY_NAMES } from '@/utils/constants/public-categories.constants';
import { Calendar, MapPin, Star, Users } from 'lucide-react';

const categoryMeta: Record<
  (typeof PUBLIC_CATEGORY_NAMES)[number],
  { count: string; icon: string }
> = {
  'Salão de Beleza': { count: '1.2K+', icon: '💄' },
  Barbearia: { count: '890', icon: '✂️' },
  'Spa & Massagem': { count: '450', icon: '🧘‍♀️' },
  Odontologia: { count: '320', icon: '🦷' },
  'Personal Trainer': { count: '760', icon: '💪' },
  Estética: { count: '540', icon: '✨' },
  Manicure: { count: '680', icon: '💅' },
  Psicologia: { count: '420', icon: '🧠' },
  Nutrição: { count: '380', icon: '🥗' },
  Fisioterapia: { count: '510', icon: '🏥' },
  Pilates: { count: '290', icon: '🤸‍♀️' },
  Tatuagem: { count: '340', icon: '🎨' },
  'Pet Shop': { count: '620', icon: '🐶' },
  Fotografia: { count: '280', icon: '📸' },
  Mecânica: { count: '450', icon: '🔧' },
  Limpeza: { count: '590', icon: '🧹' },
  Advocacia: { count: '310', icon: '⚖️' },
  Contabilidade: { count: '270', icon: '📊' },
  Academia: { count: '720', icon: '🏋️' },
  Yoga: { count: '330', icon: '🧘' },
  Veterinário: { count: '410', icon: '🩺' },
  Dermatologia: { count: '390', icon: '💆' },
  Consultoria: { count: '260', icon: '💼' },
  Design: { count: '350', icon: '🎨' },
  Marketing: { count: '300', icon: '📱' },
  Carpintaria: { count: '240', icon: '🪵' },
  Jardinagem: { count: '370', icon: '🌱' },
  Eletricista: { count: '490', icon: '⚡' },
  Encanador: { count: '460', icon: '🔩' },
  Pintura: { count: '380', icon: '🎨' },
};

export const featuredCategories = PUBLIC_CATEGORY_NAMES.map((name) => ({
  name,
  ...categoryMeta[name],
}));

export const stats = [
  {
    label: 'Agendamentos hoje',
    value: '2.4K',
    icon: Calendar,
    color: 'text-blue-600',
  },
  {
    label: 'Profissionais ativos',
    value: '3.2K',
    icon: Users,
    color: 'text-green-600',
  },
  { label: 'Cidades', value: '150+', icon: MapPin, color: 'text-purple-600' },
  { label: 'Avaliação', value: '4.9', icon: Star, color: 'text-yellow-600' },
];
