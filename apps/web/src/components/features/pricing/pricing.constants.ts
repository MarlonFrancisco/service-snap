export type TPricingBenefit = {
  title: string;
  description: string;
  desktopOnly?: boolean;
};

export const PRICING_BENEFITS: TPricingBenefit[] = [
  {
    title: 'Agendamento via WhatsApp',
    description:
      'Confirmações e lembretes no app que seus clientes já usam todos os dias.',
  },
  {
    title: 'Agenda visual intuitiva',
    description:
      'Calendário completo para horários e equipe, com visão clara do dia a dia.',
  },
  {
    title: 'Gestão de múltiplas lojas',
    description:
      'Unidades e franquias em um só painel, com controle por localização.',
  },
  {
    title: 'Insights do negócio',
    description:
      'Métricas de receita, faltas e agendamentos para decidir com dados.',
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
