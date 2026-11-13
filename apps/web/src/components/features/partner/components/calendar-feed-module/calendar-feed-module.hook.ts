'use client';

import { useCalendarFeedMutations } from '@/hooks/partner/use-calendar-feed-mutations';
import { useCalendarFeedQuery } from '@/hooks/use-query/use-calendar-feed-query';
import { useStoreMembersQuery } from '@/hooks/use-query/use-store-members-query';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useCallback, useState, type FocusEvent } from 'react';
import { toast } from 'sonner';
import { useStoreAvailability } from '../notifications-module/notifications-module.hook';
import { CALENDAR_FEED_CONFIRM_CONTENT } from './calendar-feed-module.constants';
import {
  canChooseMember,
  getDefaultMemberId,
  getMemberOptions,
} from './calendar-feed-module.helpers';
import type { TCalendarFeedAction } from './calendar-feed-module.types';

export const useCalendarFeedModule = () => {
  const { storeId, storeAvailability, retryStore } = useStoreAvailability();
  const { user, isPendingUser } = useUserQuery();
  const {
    storeMembers,
    isPendingStoreMembers,
    isError: isMembersError,
    isFetching: isMembersFetching,
    refetch: refetchMembers,
  } = useStoreMembersQuery({ storeId });

  const currentMember = user
    ? storeMembers.find((member) => member.user?.id === user.id)
    : undefined;
  const memberOptions = getMemberOptions(storeMembers, currentMember);

  const [chosenMemberId, setChosenMemberId] = useState('');
  // A escolha some ao trocar de loja: volta para o padrão da loja nova.
  const memberId = memberOptions.some(({ id }) => id === chosenMemberId)
    ? chosenMemberId
    : getDefaultMemberId(memberOptions, currentMember);
  const selectedMember = memberOptions.find(({ id }) => id === memberId);
  const target = { storeId, memberId };

  const {
    calendarFeed,
    isCalendarFeedPending,
    isCalendarFeedError,
    isCalendarFeedFetching,
    refetchCalendarFeed,
  } = useCalendarFeedQuery(target);
  const { rotateFeed, isRotatePending, revokeFeed, isRevokePending } =
    useCalendarFeedMutations();

  const [pendingAction, setPendingAction] =
    useState<TCalendarFeedAction | null>(null);

  const isStoreReady = storeAvailability === 'ready';
  const isLoading =
    storeAvailability === 'loading' ||
    (isStoreReady &&
      !isMembersError &&
      (isPendingUser || isPendingStoreMembers || isCalendarFeedPending));
  const isError =
    storeAvailability === 'error' ||
    (isStoreReady && (isMembersError || isCalendarFeedError));

  const handleRetry = useCallback(() => {
    if (!isStoreReady) {
      retryStore();
      return;
    }
    if (isMembersError) {
      void refetchMembers();
      return;
    }
    void refetchCalendarFeed();
  }, [
    isStoreReady,
    retryStore,
    isMembersError,
    refetchMembers,
    refetchCalendarFeed,
  ]);

  const handleCopyLink = async () => {
    if (!calendarFeed?.url) return;

    try {
      await navigator.clipboard.writeText(calendarFeed.url);
      toast.success('Link copiado. Agora é só colar no calendário.');
    } catch {
      toast.error('Não foi possível copiar. Selecione o link e copie.');
    }
  };

  const handleSelectLink = (event: FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };

  const handleCreateLink = () => {
    if (!memberId) return;
    rotateFeed({ target, hadLink: false });
  };

  const handleConfirmAction = () => {
    if (!pendingAction || !memberId) return;

    const onSettled = () => setPendingAction(null);
    if (pendingAction === 'rotate') {
      rotateFeed({ target, hadLink: true }, { onSettled });
      return;
    }
    revokeFeed(target, { onSettled });
  };

  const handleCancelAction = () => {
    if (isRotatePending || isRevokePending) return;
    setPendingAction(null);
  };

  return {
    hasNoStore: storeAvailability === 'no-store',
    isLoading,
    isError,
    handleRetry,
    isRetrying: isMembersFetching || isCalendarFeedFetching,
    hasNoMembers: memberOptions.length === 0,
    canChooseMember: canChooseMember(currentMember),
    memberOptions,
    memberId,
    memberName: selectedMember?.name ?? '',
    handleMemberChange: setChosenMemberId,
    calendarFeed,
    handleCopyLink,
    handleSelectLink,
    handleCreateLink,
    isCreatePending: isRotatePending && !pendingAction,
    pendingAction,
    confirmContent: pendingAction
      ? CALENDAR_FEED_CONFIRM_CONTENT[pendingAction]
      : null,
    isConfirmPending: isRotatePending || isRevokePending,
    handleRequestRotate: () => setPendingAction('rotate'),
    handleRequestRevoke: () => setPendingAction('revoke'),
    handleConfirmAction,
    handleCancelAction,
  };
};
