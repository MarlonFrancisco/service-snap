import {
  Bell,
  Briefcase,
  Calendar,
  ChartNoAxesColumn,
  Clock,
  CreditCard,
  Home,
  Lock,
  Plug,
  Store,
  Users,
} from 'lucide-react';
import type { TNavItem, TNavLinkItem } from './admin-sidebar.types';

/** Só a estrutura: o acesso por plano é aplicado em `useAdminSidebar`. */
export const PARTNER_NAV_ITEMS: readonly TNavItem[] = [
  {
    kind: 'link',
    id: 'home',
    label: 'Início',
    icon: Home,
    href: '/partner/dashboard',
    requires: ['DASHBOARD_GENERAL_ACCESS'],
  },
  {
    kind: 'link',
    id: 'agenda',
    label: 'Agenda',
    icon: Calendar,
    href: '/partner/agenda',
  },
  {
    kind: 'link',
    id: 'customers',
    label: 'Clientes',
    icon: Users,
    href: '/partner/clientes',
  },
  {
    kind: 'group',
    id: 'analytics',
    label: 'Análises',
    icon: ChartNoAxesColumn,
    requires: ['DASHBOARD_GENERAL_ACCESS'],
    children: [
      {
        id: 'analytics-sales',
        label: 'Vendas',
        href: '/partner/dashboard/sales',
        requires: ['DASHBOARD_SALES_ACCESS'],
      },
      {
        id: 'analytics-operational',
        label: 'Operação',
        href: '/partner/dashboard/operational',
        requires: ['DASHBOARD_OPERATIONAL_ACCESS'],
      },
      {
        id: 'analytics-customers',
        label: 'Clientes',
        href: '/partner/dashboard/customers',
        requires: ['DASHBOARD_CUSTOMERS_ACCESS'],
      },
    ],
  },
  {
    kind: 'link',
    id: 'stores',
    label: 'Lojas',
    icon: Store,
    href: '/partner/stores',
  },
  {
    kind: 'link',
    id: 'services',
    label: 'Serviços',
    icon: Briefcase,
    href: '/partner/services',
  },
  {
    kind: 'group',
    id: 'notifications',
    label: 'Notificações',
    icon: Bell,
    children: [
      {
        id: 'notifications-history',
        label: 'Histórico',
        href: '/partner/notifications/history',
      },
      {
        id: 'notifications-email',
        label: 'E-mail',
        href: '/partner/notifications/email-settings',
      },
      {
        id: 'notifications-whatsapp',
        label: 'WhatsApp',
        href: '/partner/notifications/whatsapp-settings',
        requires: ['WHATSAPP_INTEGRATION'],
      },
    ],
  },
  {
    kind: 'group',
    id: 'plan',
    label: 'Plano',
    icon: CreditCard,
    children: [
      {
        id: 'plan-current',
        label: 'Meu plano',
        href: '/partner/plans/me',
      },
      {
        id: 'plan-upgrade',
        label: 'Upgrade',
        href: '/partner/plans/upgrade',
      },
    ],
  },
  {
    kind: 'group',
    id: 'integrations',
    label: 'Integrações',
    icon: Plug,
    requires: ['WHATSAPP_INTEGRATION'],
    children: [
      {
        id: 'integrations-whatsapp',
        label: 'WhatsApp',
        href: '/partner/settings/whatsapp',
        requires: ['WHATSAPP_INTEGRATION'],
      },
    ],
  },
];

export const PARTNER_NAV_HREFS: readonly string[] = PARTNER_NAV_ITEMS.flatMap(
  (item) =>
    item.kind === 'group'
      ? item.children.map((child) => child.href)
      : [item.href],
);

/**
 * Menu do profissional: só a própria agenda. Bloqueios e horário abrem os
 * painéis da agenda pelo parâmetro `painel`.
 */
export const PROFESSIONAL_NAV_ITEMS: readonly TNavLinkItem[] = [
  {
    kind: 'link',
    id: 'my-agenda',
    label: 'Minha agenda',
    icon: Calendar,
    href: '/partner/agenda',
  },
  {
    kind: 'link',
    id: 'my-blocks',
    label: 'Meus bloqueios',
    icon: Lock,
    href: '/partner/agenda?painel=bloqueios',
  },
  {
    kind: 'link',
    id: 'my-hours',
    label: 'Meu horário',
    icon: Clock,
    href: '/partner/agenda?painel=horario',
  },
];
