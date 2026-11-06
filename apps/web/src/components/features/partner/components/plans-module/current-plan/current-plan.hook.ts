'use client';

import { useReferralShareCard } from '@/components/features/referral/referral-share-card/referral-share-card.hook';
import { useSubscriptionMutations } from '@/hooks';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const useCurrentPlan = () => {
  const { currentPlan } = useSubscriptionQuery();
  const { cancelSubscriptionMutation, updateSubscriptionMutation } =
    useSubscriptionMutations();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const analytics = useAnalytics();
  const hasTrackedViewRef = useRef(false);
  // O card de parceiro mantém a ordem dos links e o link compartilhado de `/pricing?ref=`.
  const referralShare = useReferralShareCard({ variant: 'partner' });

  const paymentHistory = useMemo(
    () => currentPlan?.invoices || [],
    [currentPlan?.invoices],
  );

  useEffect(() => {
    if (hasTrackedViewRef.current || !currentPlan) return;
    hasTrackedViewRef.current = true;

    analytics.track('current_plan_viewed', {
      plan_id: currentPlan.planId,
      cancel_scheduled: Boolean(currentPlan.cancelAtPeriodEnd),
    });
  }, [currentPlan, analytics]);

  // Abrir o diálogo para reativar não é início de cancelamento.
  const handleCancelDialogOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen && !currentPlan?.cancelAtPeriodEnd) {
        analytics.track('subscription_cancel_started', {
          plan_id: currentPlan?.planId,
        });
      }
      setIsCancelDialogOpen(isOpen);
    },
    [currentPlan?.cancelAtPeriodEnd, currentPlan?.planId, analytics],
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
    setIsCancelDialogOpen: handleCancelDialogOpenChange,
    handleCancelSubscription,
    isCancelingSubscription: cancelSubscriptionMutation.isPending,
    isUpdatingSubscription: updateSubscriptionMutation.isPending,
  };
};
