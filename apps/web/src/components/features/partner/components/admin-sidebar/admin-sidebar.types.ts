import type { LucideIcon } from 'lucide-react';
import type { TPlanFeatureFlag } from '../plan-feature-gate';

export type { TPlanFeatureFlag, TPlanFeatures } from '../plan-feature-gate';

export type TNavSubItem = {
  id: string;
  label: string;
  href: string;
  requires?: readonly TPlanFeatureFlag[];
  /** Calculado em `useAdminSidebar`: o item aparece, mas o plano não libera. */
  isLocked?: boolean;
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
  isLocked?: boolean;
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
