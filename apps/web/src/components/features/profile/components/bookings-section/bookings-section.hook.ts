import { useScheduleMutations } from '@/hooks';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useReviewsStore } from '@/store';
import { IAppointment } from '@/types/api/schedule.types';
import { IUser } from '@/types/api/users.types';
import { cookies } from '@/utils/helpers/cookie.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useCallback, useMemo, useState } from 'react';

const MS_PER_HOUR = 60 * 60 * 1000;

/** Horas entre agora e o início do agendamento (negativo se já passou). */
const getHoursBefore = ({ date, startTime }: IAppointment) => {
  const start = new Date(`${date.slice(0, 10)}T${startTime}`).getTime();
  return Number.isNaN(start)
    ? undefined
    : Math.round((start - Date.now()) / MS_PER_HOUR);
};

export const useBookingsSection = () => {
  const analytics = useAnalytics();
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

  const handleOpenDetails = useCallback(
    (booking: IAppointment) => {
      setSelectedBooking(booking);
      analytics.track('appointment_details_opened', {
        appointment_id: booking.id,
        store_id: booking.store?.id,
      });
    },
    [analytics],
  );

  const handleStartCancel = useCallback(
    (booking: IAppointment) => {
      setBookingToCancel(booking);
      analytics.track('appointment_cancel_started', {
        appointment_id: booking.id,
      });
    },
    [analytics],
  );

  const handleRebook = useCallback(
    (storeId: string) => {
      analytics.track('rebook_clicked', { store_id: storeId });
    },
    [analytics],
  );

  const handleCancelBooking = useCallback(() => {
    const booking = bookingToCancel!;

    deleteSchedule(booking, {
      onSuccess: () => {
        analytics.track('appointment_cancelled', {
          appointment_id: booking.id,
          store_id: booking.store.id,
          source: 'customer',
          hours_before: getHoursBefore(booking),
        });

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
      onError: () => {
        analytics.track('appointment_cancel_failed', {
          appointment_id: booking.id,
          source: 'customer',
        });
      },
    });

    setBookingToCancel(undefined);
  }, [analytics, deleteSchedule, bookingToCancel]);

  const handleReview = useCallback(
    (booking: IAppointment) => {
      setReviewsAttributesAction({
        storeId: booking.store.id,
        businessName: booking.store.name,
        isOpen: true,
      });
      analytics.track('review_started', {
        store_id: booking.store.id,
        source: 'profile_bookings',
      });
    },
    [analytics, setReviewsAttributesAction],
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
    handleOpenDetails,
    handleStartCancel,
    handleRebook,
  };
};
