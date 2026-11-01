'use client';

import { cn } from '@repo/ui';
import Link from 'next/link';
import {
  PARTNER_NAV_ICON_CLASS,
  PARTNER_NAV_ITEM_ACTIVE_CLASS,
  PARTNER_NAV_ITEM_CLASS,
  PARTNER_NAV_ITEM_IDLE_CLASS,
} from '../../../../partner.styles';
import type { TNavLinkItem } from '../../admin-sidebar.types';

type TAdminSidebarMenuItemConfig = {
  item: TNavLinkItem;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate: () => void;
};

export const AdminSidebarMenuItem = ({
  item,
  isActive,
  isCollapsed,
  onNavigate,
}: TAdminSidebarMenuItemConfig) => {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        aria-label={isCollapsed ? item.label : undefined}
        title={isCollapsed ? item.label : undefined}
        onClick={onNavigate}
        className={cn(
          PARTNER_NAV_ITEM_CLASS,
          isActive ? PARTNER_NAV_ITEM_ACTIVE_CLASS : PARTNER_NAV_ITEM_IDLE_CLASS,
          isCollapsed && 'justify-center px-0',
        )}
      >
        <Icon className={PARTNER_NAV_ICON_CLASS} aria-hidden="true" />
        {!isCollapsed && item.label}
      </Link>
    </li>
  );
};
