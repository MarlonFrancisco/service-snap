export type TPricingBenefit = {
  title: string;
  description: string;
  desktopOnly?: boolean;
};

export const PRICING_BENEFITS: TPricingBenefit[] = [
  {
    title: 'Lembretes por WhatsApp',
    description:
      'A partir do plano Professional, com o seu próprio número; tarifas da Meta faturadas diretamente ao negócio.',
  },
  {
    title: 'Agenda visual intuitiva',
    description:
      'Calendário completo para horários e equipe, com visão clara do dia a dia.',
  },
  {
    title: 'Gestão de múltiplas lojas',
    description:
      'A partir do plano Business: unidades e franquias em um só painel, com controle por localização.',
  },
  {
    title: 'Insights do negócio',
    description:
      'A partir do plano Professional: métricas de receita, faltas e agendamentos para decidir com dados.',
  },
  {
    title: 'Busca e recomendações',
    description:
      'Seus clientes encontram serviços com facilidade e voltam com mais frequência.',
    desktopOnly: true,
  },
  {
    title: 'Avaliações e reputação',
    description:
      'Reviews dos clientes para construir confiança e destacar seu espaço.',
    desktopOnly: true,
  },
];

export const PRICING_PILL_CLASS =
  'inline-block rounded-full bg-surface-2 px-3 py-[0.4375rem] text-[0.6875rem] font-bold tracking-[0.06em] uppercase md:px-3.5 md:py-2 md:text-xs';

export const PRICING_PLAN_COLUMNS_CLASS =
  'md:grid-cols-[repeat(auto-fit,minmax(min(16.25rem,100%),1fr))]';
