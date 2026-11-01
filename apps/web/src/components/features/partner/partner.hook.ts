'use client';

import { useStoreQuery } from '@/hooks/use-query/use-store-query';
import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { useServicesStore } from '@/store';
import { usePartnerStore } from '@/store/partner';
import {
  getPartnerModuleConfig,
  PARTNER_DESKTOP_MEDIA_QUERY,
} from '@/utils/constants/partner.constants';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

export const usePartner = () => {
  const pathname = usePathname();
  const setActiveStore = usePartnerStore((state) => state.setActiveStore);
  const activeStore = usePartnerStore((state) => state.activeStore);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const currentModule = getPartnerModuleConfig(pathname);

  const { stores } = useStoresQuery();

  const { store } = useStoreQuery({
    storeId: activeStore.id || stores[0]?.id || '',
  });

  const showStoreSelector =
    !!currentModule.showStoreSelector && !!activeStore?.id;

  useEffect(() => {
    if (store?.id) {
      setActiveStore(store);
      useServicesStore.setState({ services: store.services });
    }
  }, [store, setActiveStore]);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // A gaveta só existe abaixo de `lg`; aberta ao crescer a janela, deixaria o
  // overlay e o bloqueio de rolagem sobre o painel.
  useEffect(() => {
    const desktopQuery = window.matchMedia(PARTNER_DESKTOP_MEDIA_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsDrawerOpen(false);
    };

    desktopQuery.addEventListener('change', handleChange);
    return () => desktopQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== SIDEBAR_KEYBOARD_SHORTCUT ||
        !(event.metaKey || event.ctrlKey)
      ) {
        return;
      }

      event.preventDefault();

      if (window.matchMedia(PARTNER_DESKTOP_MEDIA_QUERY).matches) {
        setIsSidebarCollapsed((isCollapsed) => !isCollapsed);
      } else {
        setIsDrawerOpen((isOpen) => !isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const handleCloseDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const handleToggleSidebar = useCallback(
    () => setIsSidebarCollapsed((isCollapsed) => !isCollapsed),
    [],
  );

  return {
    currentModule,
    showStoreSelector,
    isDrawerOpen,
    isSidebarCollapsed,
    setIsDrawerOpen,
    handleOpenDrawer,
    handleCloseDrawer,
    handleToggleSidebar,
  };
};
