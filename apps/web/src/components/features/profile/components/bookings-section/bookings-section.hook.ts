import { getStoreWhatsAppUrl } from '@/components/features/booking/components/booking-confirmation/booking-confirmation.helpers';
import { useUsersMutations } from '@/hooks/use-mutations/use-users-mutations';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useReviewsStore } from '@/store';
import { IAppointment } from '@/types/api/schedule.types';
import { IUser } from '@/types/api/users.types';
import { cookies } from '@/utils/helpers/cookie.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { TPolicyBlock, TProfileVisit } from './bookings-section.types';
import {
  getPolicyBlockMessage,
  groupVisits,
  HISTORY_STATUSES,
} from './utils/bookings-section.helpers';

const MS_PER_HOUR = 60 * 60 * 1000;

/** Horas entre agora e o início do agendamento (negativo se já passou). */
const getHoursBefore = ({ date, startTime }: IAppointment) => {
  const start = new Date(`${date.slice(0, 10)}T${startTime}`).getTime();
  return Number.isNaN(start)
    ? undefined
    : Math.round((start - Date.now()) / MS_PER_HOUR);
};

const buildPolicyBlock = (
  visit: TProfileVisit,
  action: 'cancel' | 'reschedule',
  message: string,
): TPolicyBlock => ({
  title:
    action === 'cancel'
      ? 'Não dá para cancelar pelo site'
      : 'Não dá para remarcar pelo site',
  message,
  hint:
    action === 'cancel'
      ? 'Fale com a loja para cancelar o horário.'
      : 'Fale com a loja para combinar um novo horário.',
  whatsAppUrl: getStoreWhatsAppUrl(visit.appointment.store),
});

export const useBookingsSection = () => {
  const analytics = useAnalytics();
  const [selectedVisit, setSelectedVisit] = useState<TProfileVisit>();
  const [visitToCancel, setVisitToCancel] = useState<TProfileVisit>();
  const [visitToReschedule, setVisitToReschedule] = useState<TProfileVisit>();
  const [policyBlock, setPolicyBlock] = useState<TPolicyBlock | null>(null);

  const { cancelBooking } = useUsersMutations();
  const { user } = useUserQuery();

  const setReviewsAttributesAction = useReviewsStore(
    (state) => state.setReviewsAttributesAction,
  );

  // Uma visita com vários serviços aparece uma vez só
  const upcomingVisits = useMemo(
    () =>
      groupVisits(
        user?.schedules?.filter(
          (schedule) => schedule.status === 'scheduled',
        ) ?? [],
      ),
    [user?.schedules],
  );

  const pastBookings = useMemo(() => {
    return (
      user?.schedules?.filter((schedule) =>
        HISTORY_STATUSES.includes(schedule.status),
      ) ?? []
    );
  }, [user?.schedules]);

  const handleOpenDetails = useCallback(
    (visit: TProfileVisit) => {
      setSelectedVisit(visit);
      analytics.track('appointment_details_opened', {
        appointment_id: visit.id,
        store_id: visit.appointment.store?.id,
      });
    },
    [analytics],
  );

  const handleStartCancel = useCallback(
    (visit: TProfileVisit) => {
      setVisitToCancel(visit);
      analytics.track('appointment_cancel_started', {
        appointment_id: visit.id,
      });
    },
    [analytics],
  );

  const handleStartReschedule = useCallback((visit: TProfileVisit) => {
    setVisitToReschedule(visit);
  }, []);

  const handleCloseReschedule = useCallback(() => {
    setVisitToReschedule(undefined);
  }, []);

  const handleReschedulePolicyBlocked = useCallback(
    (message: string) => {
      if (visitToReschedule) {
        setPolicyBlock(
          buildPolicyBlock(visitToReschedule, 'reschedule', message),
        );
      }
      setVisitToReschedule(undefined);
    },
    [visitToReschedule],
  );

  const handleClosePolicyBlock = useCallback(() => {
    setPolicyBlock(null);
  }, []);

  const handleRebook = useCallback(
    (storeId: string) => {
      analytics.track('rebook_clicked', { store_id: storeId });
    },
    [analytics],
  );

  const handleCancelBooking = useCallback(() => {
    const visit = visitToCancel!;
    const booking = visit.appointment;
    const visitIds = new Set(visit.appointments.map(({ id }) => id));

    cancelBooking(booking, {
      onSuccess: () => {
        analytics.track('appointment_cancelled', {
          appointment_id: booking.id,
          store_id: booking.store.id,
          source: 'customer',
          hours_before: getHoursBefore(booking),
        });

        getQueryClient().setQueryData(
          CACHE_QUERY_KEYS.user(cookies.get('user_identification')!),
          // Continua no histórico, agora como cancelado (a visita inteira)
          (old: IUser | undefined) =>
            old && {
              ...old,
              schedules: old.schedules.map((schedule) =>
                visitIds.has(schedule.id)
                  ? { ...schedule, status: 'cancelled' as const }
                  : schedule,
              ),
            },
        );
      },
      onError: (error) => {
        analytics.track('appointment_cancel_failed', {
          appointment_id: booking.id,
          source: 'customer',
        });

        const policyMessage = getPolicyBlockMessage(error);
        if (policyMessage) {
          setPolicyBlock(buildPolicyBlock(visit, 'cancel', policyMessage));
          return;
        }
        toast.error('Não foi possível cancelar o agendamento');
      },
    });

    setVisitToCancel(undefined);
  }, [analytics, cancelBooking, visitToCancel]);

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
    upcomingVisits,
    pastBookings,
    selectedVisit,
    visitToCancel,
    visitToReschedule,
    policyBlock,
    setSelectedVisit,
    setVisitToCancel,
    handleCancelBooking,
    handleReview,
    handleOpenDetails,
    handleStartCancel,
    handleStartReschedule,
    handleCloseReschedule,
    handleReschedulePolicyBlocked,
    handleClosePolicyBlock,
    handleRebook,
  };
};
