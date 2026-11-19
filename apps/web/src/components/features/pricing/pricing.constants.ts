export type TPricingBenefit = {
  title: string;
  description: string;
  desktopOnly?: boolean;
};

export const PRICING_BENEFITS: TPricingBenefit[] = [
  {
    title: 'Lembretes por WhatsApp',
    description:
      'Confirmações e lembretes a partir do plano Professional, com a conta WhatsApp Business do próprio negócio. Tarifas da Meta à parte.',
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
