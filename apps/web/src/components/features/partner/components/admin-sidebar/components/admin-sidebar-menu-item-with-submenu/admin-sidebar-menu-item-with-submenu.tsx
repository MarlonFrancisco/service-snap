'use client';

import { cn, Popover, PopoverContent, PopoverTrigger } from '@repo/ui';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import {
  PARTNER_NAV_ICON_CLASS,
  PARTNER_NAV_ITEM_ACTIVE_CLASS,
  PARTNER_NAV_ITEM_CLASS,
  PARTNER_NAV_ITEM_IDLE_CLASS,
  PARTNER_NAV_SUB_ITEM_ACTIVE_CLASS,
  PARTNER_PORTAL_CLASS,
} from '../../../../partner.styles';
import type { TNavGroupItem, TNavSubItem } from '../../admin-sidebar.types';
import { AdminSidebarLock } from '../admin-sidebar-lock';

type TAdminSidebarMenuItemWithSubmenuConfig = {
  item: TNavGroupItem;
  activeHref: string | null;
  isActive: boolean;
  isOpen: boolean;
  isFlyoutOpen: boolean;
  isCollapsed: boolean;
  onToggle: (groupId: string) => void;
  onFlyoutOpenChange: (groupId: string, isOpen: boolean) => void;
  onNavigate: () => void;
};

type TSubItemLinkConfig = {
  subItem: TNavSubItem;
  isActive: boolean;
  isIndented?: boolean;
  onNavigate: () => void;
};

const SubItemLink = ({
  subItem,
  isActive,
  isIndented = false,
  onNavigate,
}: TSubItemLinkConfig) => (
  <li>
    <Link
      href={subItem.href}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
      className={cn(
        PARTNER_NAV_ITEM_CLASS,
        isActive
          ? PARTNER_NAV_SUB_ITEM_ACTIVE_CLASS
          : PARTNER_NAV_ITEM_IDLE_CLASS,
        // Alinha ao rótulo do grupo: 18px do ícone + 10px de gap.
        isIndented && 'pl-10',
      )}
    >
      {subItem.label}
      {subItem.isLocked ? <AdminSidebarLock /> : null}
    </Link>
  </li>
);

export const AdminSidebarMenuItemWithSubmenu = ({
  item,
  activeHref,
  isActive,
  isOpen,
  isFlyoutOpen,
  isCollapsed,
  onToggle,
  onFlyoutOpenChange,
  onNavigate,
}: TAdminSidebarMenuItemWithSubmenuConfig) => {
  const Icon = item.icon;
  const triggerStateClass = isActive
    ? PARTNER_NAV_ITEM_ACTIVE_CLASS
    : PARTNER_NAV_ITEM_IDLE_CLASS;

  if (isCollapsed) {
    return (
      <li>
        <Popover
          open={isFlyoutOpen}
          onOpenChange={(open) => onFlyoutOpenChange(item.id, open)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={item.label}
              title={item.label}
              className={cn(
                PARTNER_NAV_ITEM_CLASS,
                triggerStateClass,
                'justify-center px-0',
              )}
            >
              <Icon className={PARTNER_NAV_ICON_CLASS} aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={8}
            className={cn(
              PARTNER_PORTAL_CLASS,
              'w-56 rounded-[22px] border-[#E3E1EA] bg-white p-2',
            )}
          >
            <p className="px-3 py-2 text-sm font-bold">{item.label}</p>
            <ul className="grid gap-0.5">
              {item.children.map((subItem) => (
                <SubItemLink
                  key={subItem.id}
                  subItem={subItem}
                  isActive={activeHref === subItem.href}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </li>
    );
  }

  const submenuId = `partner-nav-${item.id}`;

  return (
    <li className="grid gap-0.5">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={isOpen ? submenuId : undefined}
        onClick={() => onToggle(item.id)}
        className={cn(PARTNER_NAV_ITEM_CLASS, triggerStateClass)}
      >
        <Icon className={PARTNER_NAV_ICON_CLASS} aria-hidden="true" />
        {item.label}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'ml-auto size-4 shrink-0 transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <ul id={submenuId} className="grid gap-0.5">
          {item.children.map((subItem) => (
            <SubItemLink
              key={subItem.id}
              subItem={subItem}
              isActive={activeHref === subItem.href}
              isIndented
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
