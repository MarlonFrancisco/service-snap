import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAuthStore } from '@/store/auth/auth.store';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useCallback } from 'react';

export const useMobileTabBar = () => {
  const pathname = usePathname();
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const { isLoggedIn } = useUserQuery();

  /** `/profile` redireciona visitantes para a home; abre o login no lugar. */
  const handleProtectedClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (isLoggedIn) return;

      event.preventDefault();
      openAuthAction({});
    },
    [isLoggedIn, openAuthAction],
  );

  return { isHome: pathname === '/', handleProtectedClick };
};
