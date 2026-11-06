'use client';
import { useAnalytics } from '@/providers/analytics.provider';
import { useServerUserIdentification } from '@/providers/user-identification.provider';
import { UsersService } from '@/service/users';
import { useAuthStore } from '@/store';
import { cookies } from '@/utils/helpers/cookie.helper';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import type { IAnalyticsTracker } from '@repo/analytics';
import { useEffect, useSyncExternalStore } from 'react';

const subscribeToCookie = () => () => undefined;

/**
 * O hook roda em vários componentes ao mesmo tempo: guarda, por instância do
 * tracker, o último usuário identificado para chamar `identify` uma vez só.
 */
const identifiedUserByTracker = new WeakMap<IAnalyticsTracker, string>();

export const useUserQuery = () => {
  // Cookies emit no change event: these re-render on login and navigation, and
  // useSyncExternalStore re-reads the cookie on every render.
  useAuthStore((state) => state.isOpen);
  usePathname();

  const serverIdentification = useServerUserIdentification();

  // SSR and hydration both use the server value, so their markup matches.
  const queryKey = useSyncExternalStore(
    subscribeToCookie,
    () => cookies.get('user_identification'),
    () => serverIdentification,
  );

  const { data: user, isPending: isPendingUser } = useQuery({
    queryKey: CACHE_QUERY_KEYS.user(queryKey!),
    queryFn: () => UsersService.getUser(),
    enabled: !!queryKey,
  });

  const isLoggedIn = Boolean(user?.email);
  const analytics = useAnalytics();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      if (!isPendingUser) identifiedUserByTracker.delete(analytics);
      return;
    }
    if (identifiedUserByTracker.get(analytics) === userId) return;

    identifiedUserByTracker.set(analytics, userId);
    analytics.identify(userId);
  }, [analytics, isPendingUser, userId]);

  return { user, isPendingUser, isLoggedIn };
};
