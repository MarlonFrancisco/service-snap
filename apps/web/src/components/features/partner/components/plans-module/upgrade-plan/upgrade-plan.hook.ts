import { useSubscriptionMutations } from '@/hooks';
import { usePlansQuery } from '@/hooks/use-query/use-plans-query';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { TUpgradePlanItem } from './upgrade-plan.types';

export function useUpgradePlan() {
  const { data, isPendingPlans, isErrorPlans, isFetchingPlans, refetchPlans } =
    usePlansQuery();
  const { currentPlan } = useSubscriptionQuery();
  const { createSubscriptionMutation } = useSubscriptionMutations();

  const [type, setType] = useState<'month' | 'year'>('month');
  const [hasUserPickedInterval, setHasUserPickedInterval] = useState(false);

  // Default toggle to the subscription's billing period so rank/ROI stay coherent.
  useEffect(() => {
    if (hasUserPickedInterval) return;
    if (
      currentPlan?.billingPeriod === 'year' ||
      currentPlan?.billingPeriod === 'month'
    ) {
      setType(currentPlan.billingPeriod);
    }
  }, [currentPlan?.billingPeriod, hasUserPickedInterval]);

  const handleSetType = useCallback((next: 'month' | 'year') => {
    setHasUserPickedInterval(true);
    setType(next);
  }, []);

  const filteredPlans = useMemo(() => {
    return data?.[type] || [];
  }, [data, type]);

  // Rank by product id within the toggled interval list — ignore interval mismatch
  // so month↔year toggle does not reset every card to "upgrade" / show ROI wrongly.
  const currentPlanIndex = useMemo(() => {
    if (!currentPlan?.planId) return -1;
    return filteredPlans.findIndex((plan) => plan.id === currentPlan.planId);
  }, [filteredPlans, currentPlan?.planId]);

  const isOnHighestPlan = useMemo(() => {
    if (!filteredPlans.length || currentPlanIndex < 0) return false;
    return currentPlanIndex === filteredPlans.length - 1;
  }, [filteredPlans.length, currentPlanIndex]);

  const isCancellationScheduled = Boolean(currentPlan?.cancelAtPeriodEnd);

  const planItems = useMemo<TUpgradePlanItem[]>(
    () =>
      filteredPlans.map((plan, index) => {
        const isCurrentPlan =
          plan.id === currentPlan?.planId &&
          plan.interval === currentPlan?.billingPeriod;
        const isSameTierDifferentInterval =
          plan.id === currentPlan?.planId &&
          plan.interval !== currentPlan?.billingPeriod;
        const isUpgrade =
          currentPlanIndex >= 0 ? index > currentPlanIndex : true;
        const isDowngrade =
          currentPlanIndex >= 0 ? index < currentPlanIndex : false;

        const actionLabel = isCurrentPlan
          ? 'Seu plano atual'
          : isCancellationScheduled
            ? 'Reative o plano atual primeiro'
            : isSameTierDifferentInterval
              ? `Mudar para ${plan.interval === 'month' ? 'mensal' : 'anual'}`
              : isUpgrade
                ? 'Fazer upgrade'
                : isDowngrade
                  ? 'Mudar para este plano'
                  : 'Assinar plano';

        return { plan, isCurrentPlan, actionLabel };
      }),
    [
      filteredPlans,
      currentPlan?.planId,
      currentPlan?.billingPeriod,
      currentPlanIndex,
      isCancellationScheduled,
    ],
  );

  const handleSelectPlan = useCallback(
    (planId: string) => {
      if (isCancellationScheduled) return;
      createSubscriptionMutation.mutate(planId, {
        onSuccess: ({ url }) => {
          window.location.href = url;
        },
        onError: () => {
          toast.error('Não foi possível abrir o checkout. Tente novamente.');
        },
      });
    },
    [createSubscriptionMutation, isCancellationScheduled],
  );

  return {
    planItems,
    currentPlan,
    isOnHighestPlan,
    isCancellationScheduled,
    isPendingPlans,
    isErrorPlans,
    isFetchingPlans,
    refetchPlans,
    isCreatingSubscription: createSubscriptionMutation.isPending,
    handleSelectPlan,
    type,
    setType: handleSetType,
  };
}
