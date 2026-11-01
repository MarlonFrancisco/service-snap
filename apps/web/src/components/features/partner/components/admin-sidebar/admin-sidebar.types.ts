import type { IMySubscription } from '@/types/api';
import type { LucideIcon } from 'lucide-react';

export type TPlanFeatures = IMySubscription['features'];

export type TPlanFeatureFlag = keyof Pick<
  TPlanFeatures,
  | 'DASHBOARD_GENERAL_ACCESS'
  | 'DASHBOARD_SALES_ACCESS'
  | 'DASHBOARD_OPERATIONAL_ACCESS'
  | 'DASHBOARD_CUSTOMERS_ACCESS'
  | 'WHATSAPP_INTEGRATION'
>;

export type TNavSubItem = {
  id: string;
  label: string;
  href: string;
  requires?: readonly TPlanFeatureFlag[];
};

export type TNavLinkItem = TNavSubItem & {
  kind: 'link';
  icon: LucideIcon;
};

export type TNavGroupItem = {
  kind: 'group';
  id: string;
  label: string;
  icon: LucideIcon;
  requires?: readonly TPlanFeatureFlag[];
  children: readonly TNavSubItem[];
};

export type TNavItem = TNavLinkItem | TNavGroupItem;

export type TAdminSidebarConfig = {
  isCollapsed?: boolean;
  className?: string;
  /** Chamado em todo clique de navegação, mesmo para a rota atual. */
  onNavigate?: () => void;
  /** Presente só na gaveta, onde exibe o botão de fechar. */
  onClose?: () => void;
};

export type TUseAdminSidebarConfig = Pick<TAdminSidebarConfig, 'onNavigate'>;
