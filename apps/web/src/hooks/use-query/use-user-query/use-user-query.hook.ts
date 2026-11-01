'use client';
import { useServerUserIdentification } from '@/providers/user-identification.provider';
import { UsersService } from '@/service/users';
import { useAuthStore } from '@/store';
import { cookies } from '@/utils/helpers/cookie.helper';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

const subscribeToCookie = () => () => undefined;

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

  return { user, isPendingUser, isLoggedIn };
};
