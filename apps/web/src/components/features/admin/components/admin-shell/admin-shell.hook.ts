'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { ADMIN_NAV_ITEMS, isAdminNavActive } from '../../admin.helpers';

export const useAdminShell = () => {
  const pathname = usePathname();

  const navItems = useMemo(
    () =>
      ADMIN_NAV_ITEMS.map((item) => ({
        ...item,
        isActive: isAdminNavActive(pathname, item.href),
      })),
    [pathname],
  );

  return { navItems };
};
