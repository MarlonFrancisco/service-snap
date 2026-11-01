import { useScheduleMutations } from '@/hooks';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useReviewsStore } from '@/store';
import { IAppointment } from '@/types/api/schedule.types';
import { IUser } from '@/types/api/users.types';
import { cookies } from '@/utils/helpers/cookie.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useCallback, useMemo, useState } from 'react';

export const useBookingsSection = () => {
  const [selectedBooking, setSelectedBooking] = useState<
    IAppointment | undefined
  >(undefined);
  const [bookingToCancel, setBookingToCancel] = useState<
    IAppointment | undefined
  >(undefined);

  const { deleteSchedule } = useScheduleMutations({
    storeId: '',
  });

  const { user } = useUserQuery();

  const setReviewsAttributesAction = useReviewsStore(
    (state) => state.setReviewsAttributesAction,
  );

  // TODO: Substituir mock data por dados reais da API
  const upcomingBookings = useMemo(() => {
    return (
      user?.schedules?.filter((schedule) => schedule.status === 'scheduled') ??
      []
    );
  }, [user?.schedules]);

  const pastBookings = useMemo(() => {
    return (
      user?.schedules?.filter((schedule) => schedule.status === 'completed') ??
      []
    );
  }, [user?.schedules]);

  const handleCancelBooking = useCallback(() => {
    deleteSchedule(bookingToCancel!, {
      onSuccess: () => {
        const queryClient = getQueryClient();
        queryClient.setQueryData(
          CACHE_QUERY_KEYS.user(cookies.get('user_identification')!),
          (old: IUser) => ({
            ...old,
            schedules: old.schedules.filter(
              (schedule) => schedule.id !== bookingToCancel!.id,
            ),
          }),
        );
        setBookingToCancel(undefined);
      },
    });

    setBookingToCancel(undefined);
  }, [deleteSchedule, bookingToCancel]);

  const handleReview = useCallback(
    (booking: IAppointment) => {
      setReviewsAttributesAction({
        storeId: booking.store.id,
        businessName: booking.store.name,
        isOpen: true,
      });
    },
    [setReviewsAttributesAction],
  );

  return {
    upcomingBookings,
    pastBookings,
    selectedBooking,
    bookingToCancel,
    setSelectedBooking,
    setBookingToCancel,
    handleCancelBooking,
    handleReview,
  };
};
