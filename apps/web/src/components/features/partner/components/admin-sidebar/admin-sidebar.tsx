'use client';

import { cn } from '@repo/ui';
import { useAdminSidebar } from './admin-sidebar.hook';
import type { TAdminSidebarConfig } from './admin-sidebar.types';
import { AdminSidebarFooter } from './components/admin-sidebar-footer';
import { AdminSidebarHeader } from './components/admin-sidebar-header';
import { AdminSidebarMenuItem } from './components/admin-sidebar-menu-item';
import { AdminSidebarMenuItemWithSubmenu } from './components/admin-sidebar-menu-item-with-submenu';

export const AdminSidebar = ({
  isCollapsed = false,
  className,
  onNavigate,
  onClose,
}: TAdminSidebarConfig) => {
  const {
    items,
    activeHref,
    activeGroupId,
    openGroupId,
    flyoutGroupId,
    handleToggleGroup,
    handleFlyoutOpenChange,
    handleNavigate,
  } = useAdminSidebar({ onNavigate });

  return (
    <aside
      className={cn(
        'flex h-full flex-none flex-col gap-3 overflow-x-hidden overflow-y-auto border-r border-[#EBE9F0] bg-white px-3.5 py-5 motion-safe:transition-[width] motion-safe:duration-200',
        isCollapsed ? 'w-[73px]' : 'w-[264px]',
        className,
      )}
    >
      <AdminSidebarHeader
        isCollapsed={isCollapsed}
        onClose={onClose}
        onNavigate={handleNavigate}
      />

      <nav aria-label="Navegação do painel">
        <ul className="grid gap-0.5">
          {items.map((item) =>
            item.kind === 'group' ? (
              <AdminSidebarMenuItemWithSubmenu
                key={item.id}
                item={item}
                activeHref={activeHref}
                isActive={activeGroupId === item.id}
                isOpen={openGroupId === item.id}
                isFlyoutOpen={flyoutGroupId === item.id}
                isCollapsed={isCollapsed}
                onToggle={handleToggleGroup}
                onFlyoutOpenChange={handleFlyoutOpenChange}
                onNavigate={handleNavigate}
              />
            ) : (
              <AdminSidebarMenuItem
                key={item.id}
                item={item}
                isActive={activeHref === item.href}
                isCollapsed={isCollapsed}
                onNavigate={handleNavigate}
              />
            ),
          )}
        </ul>
      </nav>

      <AdminSidebarFooter isCollapsed={isCollapsed} />
    </aside>
  );
};
