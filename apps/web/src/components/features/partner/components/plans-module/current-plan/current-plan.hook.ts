'use client';

import { useReferralShareCard } from '@/components/features/referral/referral-share-card/referral-share-card.hook';
import { useSubscriptionMutations } from '@/hooks';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useCallback, useMemo, useState } from 'react';

export const useCurrentPlan = () => {
  const { currentPlan } = useSubscriptionQuery();
  const { cancelSubscriptionMutation, updateSubscriptionMutation } =
    useSubscriptionMutations();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  // O card de parceiro mantém a ordem dos links e o link compartilhado de `/pricing?ref=`.
  const referralShare = useReferralShareCard({ variant: 'partner' });

  const paymentHistory = useMemo(
    () => currentPlan?.invoices || [],
    [currentPlan?.invoices],
  );

  const handleCancelSubscription = useCallback(async () => {
    try {
      if (currentPlan?.cancelAtPeriodEnd) {
        await updateSubscriptionMutation.mutateAsync({
          cancelAtPeriodEnd: false,
        });
      } else {
        await cancelSubscriptionMutation.mutateAsync();
      }

      setIsCancelDialogOpen(false);
    } catch {
      // As mutações já avisam a falha; o diálogo fica aberto para tentar de novo.
    }
  }, [
    currentPlan?.cancelAtPeriodEnd,
    cancelSubscriptionMutation,
    updateSubscriptionMutation,
  ]);

  return {
    currentPlan,
    paymentHistory,
    referralShare,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    handleCancelSubscription,
    isCancelingSubscription: cancelSubscriptionMutation.isPending,
    isUpdatingSubscription: updateSubscriptionMutation.isPending,
  };
};
