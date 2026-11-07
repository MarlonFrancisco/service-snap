import type { TModuleConfig } from '@/components/features/partner/partner.types';

export const PARTNER_DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

export const MODULE_CONFIG: Record<string, TModuleConfig> = {
  '/partner/dashboard': {
    title: 'Início',
    description: 'Visão geral e métricas em tempo real',
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
