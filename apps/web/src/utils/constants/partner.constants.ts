import type { TModuleConfig } from '@/components/features/partner/partner.types';

export const PARTNER_DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

export const MODULE_CONFIG: Record<string, TModuleConfig> = {
  '/partner/dashboard': {
    title: 'Início',
    description: 'Visão geral e métricas do seu negócio',
    showStoreSelector: true,
  },
  '/partner/dashboard/sales': {
    title: 'Vendas',
    description: 'Visualize as vendas e receita da sua empresa',
    showStoreSelector: true,
  },
  '/partner/dashboard/operational': {
    title: 'Operação',
    description: 'Visualize as métricas operacionais da sua empresa',
    showStoreSelector: true,
  },
  '/partner/dashboard/customers': {
    title: 'Clientes',
    description: 'Visualize os clientes da sua empresa',
    showStoreSelector: true,
  },
  '/partner/clientes': {
    title: 'Clientes',
    description: 'Clientes da loja: contato, visitas, etiquetas e anotações',
    showStoreSelector: true,
  },
  '/partner/caixa': {
    title: 'Caixa',
    description: 'Abra e feche o caixa e acompanhe os pagamentos do dia',
    showStoreSelector: true,
  },
  '/partner/caixa/anteriores': {
    title: 'Caixas anteriores',
    description: 'Caixas fechados, com o que foi contado e a diferença',
    showStoreSelector: true,
  },
  '/partner/comissoes': {
    title: 'Comissões',
    description: 'Regras e relatório de comissões da equipe',
    showStoreSelector: true,
  },
  '/partner/pacotes': {
    title: 'Pacotes',
    description: 'Pacotes vendidos fora do app, com o saldo de sessões',
    showStoreSelector: true,
  },
  '/partner/fidelidade': {
    title: 'Fidelidade',
    description: 'Recompensa para quem volta',
    showStoreSelector: true,
  },
  '/partner/campanhas': {
    title: 'Campanhas',
    description: 'Chame de volta quem não aparece há um tempo',
    showStoreSelector: true,
  },
  '/partner/anamnese': {
    title: 'Anamnese',
    description: 'Fichas de saúde que o cliente preenche antes do atendimento',
    showStoreSelector: true,
  },
  '/partner/integracoes': {
    title: 'API e webhooks',
    description: 'Chaves da API pública e webhooks da loja',
    showStoreSelector: true,
  },
  '/partner/historico-de-acoes': {
    title: 'Histórico de ações',
    description: 'Quem fez o quê na loja',
    showStoreSelector: true,
  },
  '/partner/stores': {
    title: 'Lojas',
    description: 'Gerencie todas as suas filiais em um só lugar',
    showStoreSelector: false,
  },
  '/partner/services': {
    title: 'Serviços',
    description: 'Configure os serviços oferecidos nas suas lojas',
    showStoreSelector: true,
  },
  '/partner/agenda': {
    title: 'Agenda',
    description: 'Visualize e gerencie todos os agendamentos',
    showStoreSelector: true,
  },
  '/partner/plans': {
    title: 'Plano',
    description: 'Gerencie sua assinatura e billing',
    showStoreSelector: false,
  },
  '/partner/plans/me': {
    title: 'Meu plano',
    description: 'Visualize e gerencie seu plano atual',
    showStoreSelector: false,
  },
  '/partner/plans/upgrade': {
    title: 'Upgrade',
    description: 'Fazer upgrade do seu plano',
    showStoreSelector: false,
  },
  '/partner/notifications': {
    title: 'Notificações',
    description: 'Configure lembretes e comunicações automáticas',
    showStoreSelector: true,
  },
  '/partner/notifications/history': {
    title: 'Notificações',
    description:
      'Visualize e gerencie todas as notificações enviadas aos seus clientes',
    showStoreSelector: true,
  },
  '/partner/notifications/email-settings': {
    title: 'Configurações de e-mail',
    description: 'Configure as notificações por e-mail',
    showStoreSelector: true,
  },
  '/partner/notifications/whatsapp-settings': {
    title: 'Configurações de WhatsApp',
    description: 'Configure as notificações por WhatsApp',
    showStoreSelector: true,
  },
  '/partner/settings/whatsapp': {
    title: 'WhatsApp',
    description: 'Conecte a conta do WhatsApp Business da sua loja',
    showStoreSelector: true,
  },
  '/partner/settings/whatsapp/connect': {
    title: 'Conectar WhatsApp',
    description: 'Passo a passo para conseguir as credenciais na Meta',
    showStoreSelector: true,
  },
  '/partner/reviews': {
    title: 'Avaliações',
    description: 'Leia e responda as avaliações dos clientes',
    showStoreSelector: true,
  },
  '/partner/settings/calendar': {
    title: 'Agenda no Google',
    description: 'Veja os atendimentos no seu calendário pessoal',
    showStoreSelector: true,
  },
  '/partner/settings/widget': {
    title: 'Widget no seu site',
    description: 'Receba agendamentos pelo site da sua loja',
    showStoreSelector: true,
  },
};

const FALLBACK_MODULE_CONFIG: TModuleConfig = {
  title: 'Painel',
  description: '',
  showStoreSelector: false,
};

/** Casa por segmento: `/partner/stores` não casa com `/partner/stores-old`. */
export const findLongestPathMatch = (
  pathname: string,
  paths: readonly string[],
): string | null =>
  paths
    .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
    .reduce<
      string | null
    >((longest, path) => (longest === null || path.length > longest.length ? path : longest), null);

export const getPartnerModuleConfig = (pathname: string): TModuleConfig => {
  const match = findLongestPathMatch(pathname, Object.keys(MODULE_CONFIG));

  return (match && MODULE_CONFIG[match]) || FALLBACK_MODULE_CONFIG;
};
