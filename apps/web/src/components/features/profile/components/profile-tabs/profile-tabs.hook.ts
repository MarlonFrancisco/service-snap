import { useAnalytics } from '@/providers/analytics.provider';
import { useCallback, useMemo } from 'react';
import type { TProfileTabsConfig } from './profile-tabs.types';

const TAB_CONFIG = [
  {
    id: 'bookings',
    label: 'Agendamentos',
    shortLabel: 'Agenda',
    href: '/profile?tab=bookings',
  },
  {
    id: 'favorites',
    label: 'Favoritos',
    shortLabel: 'Favoritos',
    href: '/profile?tab=favorites',
  },
  {
    id: 'settings',
    label: 'Privacidade',
    shortLabel: 'Privacidade',
    href: '/profile?tab=settings',
  },
] as const;

export const useProfileTabs = ({
  activeTab,
  bookingsCount,
  favoritesCount,
}: TProfileTabsConfig) => {
  const analytics = useAnalytics();
  const tabs = useMemo(() => {
    const counts = {
      bookings: bookingsCount,
      favorites: favoritesCount,
      settings: 0,
    };

    return TAB_CONFIG.map((tab) => ({
      ...tab,
      count: counts[tab.id],
      isActive: tab.id === activeTab,
    }));
  }, [activeTab, bookingsCount, favoritesCount]);

  // Os dados das abas já estão no cliente: troca a URL sem refazer a página no
  // servidor. O `useSearchParams` acompanha o pushState e o botão voltar.
  const handleNavigate = useCallback(
    (event: { preventDefault: () => void }, href: string) => {
      event.preventDefault();
      window.history.pushState(null, '', href);

      const tab = TAB_CONFIG.find((item) => item.href === href);
      if (tab && tab.id !== activeTab) {
        analytics.track('profile_tab_viewed', { tab: tab.id });
      }
    },
    [activeTab, analytics],
  );

  return { tabs, handleNavigate };
};
