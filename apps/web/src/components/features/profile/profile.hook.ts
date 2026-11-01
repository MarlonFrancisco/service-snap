import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useMemo, useState } from 'react';
import { TProfileTab } from './profile.types';

export const useProfile = (initialTab: TProfileTab = 'bookings') => {
  const { user, isPendingUser } = useUserQuery();
  const [activeTab, setActiveTab] = useState<TProfileTab>(initialTab);

  const upcomingCount = useMemo(() => {
    return user?.schedules?.length ?? 0;
  }, [user?.schedules]);

  const favoritesCount = useMemo(() => {
    return user?.favorites?.length ?? 0;
  }, [user?.favorites]);

  return {
    activeTab,
    setActiveTab,
    user,
    isPendingUser,
    upcomingCount,
    favoritesCount,
  };
};
