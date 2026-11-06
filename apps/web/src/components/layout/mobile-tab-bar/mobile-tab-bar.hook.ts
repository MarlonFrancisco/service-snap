import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useAuthStore } from '@/store/auth/auth.store';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useCallback } from 'react';

export const useMobileTabBar = () => {
  const pathname = usePathname();
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const { isLoggedIn } = useUserQuery();
  const analytics = useAnalytics();

  const trackTab = useCallback(
    (tab: string, destination: string) => {
      analytics.track('select_content', {
        content_type: 'tab_bar',
        item_id: tab,
        destination,
      });
    },
    [analytics],
  );

  const handleTabClick = useCallback(
    (tab: string, destination: string) => {
      trackTab(tab, destination);
    },
    [trackTab],
  );

  /** `/profile` redireciona visitantes para a home; abre o login no lugar. */
  const handleProtectedClick = useCallback(
    (
      event: MouseEvent<HTMLAnchorElement>,
      tab: string,
      destination: string,
    ) => {
      trackTab(tab, destination);
      if (isLoggedIn) return;

      event.preventDefault();
      openAuthAction({ source: 'tab_bar' });
    },
    [isLoggedIn, openAuthAction, trackTab],
  );

  return { isHome: pathname === '/', handleTabClick, handleProtectedClick };
};
