import {
  BarChart3,
  Building2,
  Calendar,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type TPricingBenefit = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const PRICING_BENEFITS: TPricingBenefit[] = [
  {
    icon: Zap,
    title: 'Agendamento via WhatsApp',
    description:
      'Confirmações e lembretes no app que seus clientes já usam todos os dias.',
  },
  {
    icon: Calendar,
    title: 'Agenda visual intuitiva',
    description:
      'Calendário completo para horários e equipe, com visão clara do dia a dia.',
  },
  {
    icon: Building2,
    title: 'Gestão de múltiplas lojas',
    description:
      'Unidades e franquias em um só painel, com controle por localização.',
  },
  {
    icon: BarChart3,
    title: 'Insights do negócio',
    description:
      'Métricas de receita, faltas e agendamentos para decidir com dados.',
  },
  {
    icon: Sparkles,
    title: 'Busca e recomendações',
    description:
      'Seus clientes encontram serviços com facilidade e voltam com mais frequência.',
  },
  {
    icon: Star,
    title: 'Avaliações e reputação',
    description:
      'Reviews dos clientes para construir confiança e destacar seu espaço.',
  },
];
