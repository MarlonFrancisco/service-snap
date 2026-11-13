import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { TProfileTab } from './profile.types';

const PROFILE_TABS: readonly TProfileTab[] = [
  'bookings',
  'favorites',
  'settings',
  'personal',
];

export const useProfile = (initialTab: TProfileTab = 'bookings') => {
  const { user, isPendingUser } = useUserQuery();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  // A URL é a fonte da verdade: também muda pelos links do MobileTabBar e pelo
  // botão voltar, sem remontar este componente.
  const activeTab =
    PROFILE_TABS.find((profileTab) => profileTab === tabParam) ?? initialTab;

  // Mesma regra da lista de agendamentos: agendados e concluídos.
  const bookingsCount = useMemo(() => {
    return (
      user?.schedules?.filter(
        (schedule) =>
          schedule.status === 'scheduled' || schedule.status === 'completed',
      ).length ?? 0
    );
  }, [user?.schedules]);

  const favoritesCount = useMemo(() => {
    return user?.favorites?.length ?? 0;
  }, [user?.favorites]);

  return {
    activeTab,
    user,
    isPendingUser,
    bookingsCount,
    favoritesCount,
  };
};
