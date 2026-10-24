import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useMemo } from 'react';

export const useProfileStats = () => {
  const { user, isPendingUser } = useUserQuery();

  // Match bookings-section list (scheduled + completed; exclude cancelled).
  const totalBookings = useMemo(() => {
    return (
      user?.schedules?.filter(
        (schedule) =>
          schedule.status === 'scheduled' || schedule.status === 'completed',
      ).length ?? 0
    );
  }, [user?.schedules]);

  const upcomingCount = useMemo(() => {
    return (
      user?.schedules?.filter((schedule) => schedule.status === 'scheduled')
        .length ?? 0
    );
  }, [user?.schedules]);

  const favoritesCount = useMemo(() => {
    return user?.favorites?.length ?? 0;
  }, [user?.favorites]);

  return {
    user,
    isPendingUser,
    totalBookings,
    upcomingCount,
    favoritesCount,
  };
};
