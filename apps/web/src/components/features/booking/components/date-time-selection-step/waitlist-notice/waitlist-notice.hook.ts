'use client';
import { useWaitlistMutations } from '@/hooks/use-mutations/use-waitlist-mutations';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useWaitlistQuery } from '@/hooks/use-query/use-waitlist-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useAuthStore } from '@/store/auth/auth.store';
import { formatDateKeyLong } from '@/utils/helpers/date.helper';
import { getWaitlistProfessionalName } from '@/utils/helpers/waitlist.helper';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import {
  getLocalDateKey,
  getServiceIdsByQuantity,
} from '../../../booking.helpers';
import { useGetStore } from '../../../booking.hook';
import { TBookingFormData } from '../../../booking.schema';
import {
  buildJoinDescription,
  buildNotifyText,
  findWaitlistEntry,
  getFreeSlotMessage,
  getWaitlistJoinErrorMessage,
  isFreeSlotError,
} from './utils/waitlist-notice.helpers';

export const useWaitlistNotice = () => {
  const store = useGetStore();
  const analytics = useAnalytics();
  const { user, isLoggedIn } = useUserQuery();
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const { watch, setValue } = useFormContext<TBookingFormData>();
  const selectedServices = watch('selectedServices');
  const selectedDate = watch('selectedDate');
  const selectedProfessional = watch('selectedProfessional');
  const isAnyProfessional = watch('isAnyProfessional');

  const storeId = store?.id;
  // A fila é por um serviço: com vários no carrinho, vale o primeiro
  const service = selectedServices[0];
  const hasMultipleServices =
    getServiceIdsByQuantity(selectedServices).length > 1;
  const professional = isAnyProfessional ? null : selectedProfessional;
  const storeMemberId = professional?.id;
  const professionalName = professional
    ? `${professional.user.firstName} ${professional.user.lastName}`
    : undefined;
  const dateKey = selectedDate ? getLocalDateKey(selectedDate) : undefined;

  const { waitlistEntries, isPendingWaitlist } = useWaitlistQuery({
    storeId,
    enabled: isLoggedIn,
  });
  const { joinWaitlist, isJoiningWaitlist, leaveWaitlist, isLeavingWaitlist } =
    useWaitlistMutations();

  const currentEntry = useMemo(
    () =>
      dateKey && service
        ? findWaitlistEntry(waitlistEntries, {
            date: dateKey,
            serviceId: service.id,
            storeMemberId,
          })
        : undefined,
    [waitlistEntries, dateKey, service, storeMemberId],
  );

  const joinSelectedDay = useCallback(() => {
    if (!storeId || !service || !dateKey) return;

    joinWaitlist(
      { storeId, serviceId: service.id, storeMemberId, date: dateKey },
      {
        onSuccess: () => {
          analytics.track('waitlist_joined', {
            store_id: storeId,
            service_id: service.id,
            date: dateKey,
            professional_id: storeMemberId,
          });
        },
        onError: (error) => {
          if (isFreeSlotError(error)) {
            toast.info(
              getFreeSlotMessage({
                serviceName: service.name,
                hasMultipleServices,
              }),
            );
            return;
          }
          toast.error(getWaitlistJoinErrorMessage(error));
        },
      },
    );
  }, [
    analytics,
    joinWaitlist,
    storeId,
    service,
    dateKey,
    storeMemberId,
    hasMultipleServices,
  ]);

  // Sem login, abre o login e entra na fila assim que ele terminar
  const handleJoin = useCallback(() => {
    if (!isLoggedIn) {
      openAuthAction({ source: 'waitlist', onAuth: joinSelectedDay });
      return;
    }
    joinSelectedDay();
  }, [isLoggedIn, openAuthAction, joinSelectedDay]);

  const handleLeave = useCallback(() => {
    if (!storeId || !currentEntry) return;

    leaveWaitlist(
      { storeId, entryId: currentEntry.id },
      {
        onSuccess: () => {
          analytics.track('waitlist_left', {
            store_id: storeId,
            source: 'booking',
          });
        },
      },
    );
  }, [analytics, leaveWaitlist, storeId, currentEntry]);

  const handleChooseOtherDay = useCallback(() => {
    setValue('selectedDate', undefined);
    setValue('selectedTime', null);
    setValue('assignedProfessionalId', null);
  }, [setValue]);

  const joinedSummary = currentEntry
    ? [
        `${formatDateKeyLong(currentEntry.date)} · ${currentEntry.service.name} · ${getWaitlistProfessionalName(currentEntry)}.`,
        buildNotifyText({ channel: currentEntry.channel, email: user?.email }),
        'A vaga fica com quem reservar primeiro.',
      ].join(' ')
    : '';

  return {
    dayLabel: dateKey ? formatDateKeyLong(dateKey) : '',
    joinDescription: buildJoinDescription({
      professionalName,
      serviceName: hasMultipleServices ? service?.name : undefined,
    }),
    joinedSummary,
    isInWaitlist: Boolean(currentEntry),
    isCheckingWaitlist: isLoggedIn && isPendingWaitlist,
    isJoiningWaitlist,
    isLeavingWaitlist,
    handleJoin,
    handleLeave,
    handleChooseOtherDay,
  };
};
