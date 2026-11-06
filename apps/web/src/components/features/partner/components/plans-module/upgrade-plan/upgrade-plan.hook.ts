import { useSubscriptionMutations } from '@/hooks';
import { usePlansQuery } from '@/hooks/use-query/use-plans-query';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { toBillingPeriod } from '@/utils/helpers/analytics.helper';
import type { TPlanChangeType } from '@repo/analytics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { savePendingPurchase } from '../../../../checkout/checkout.helpers';
import type { TUpgradePlanItem } from './upgrade-plan.types';

/** A API de planos pode não enviar a moeda. */
const DEFAULT_PLAN_CURRENCY = 'BRL';

export function useUpgradePlan() {
  const { data, isPendingPlans, isErrorPlans, isFetchingPlans, refetchPlans } =
    usePlansQuery();
  const { currentPlan, isGettingCurrentPlan } = useSubscriptionQuery();
  const { createSubscriptionMutation } = useSubscriptionMutations();

  const [type, setType] = useState<'month' | 'year'>('month');
  const [hasUserPickedInterval, setHasUserPickedInterval] = useState(false);
  const analytics = useAnalytics();
  const hasTrackedViewRef = useRef(false);

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

  const handleSetType = useCallback(
    (next: 'month' | 'year') => {
      if (next !== type) {
        analytics.track('billing_period_toggled', {
          billing_period: toBillingPeriod(next),
          source: 'upgrade',
        });
      }
      setHasUserPickedInterval(true);
      setType(next);
    },
    [type, analytics],
  );

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

  // Uma vez por visita, depois que os planos e o período padrão assentam.
  useEffect(() => {
    if (
      hasTrackedViewRef.current ||
      isPendingPlans ||
      isGettingCurrentPlan ||
      !filteredPlans.length
    ) {
      return;
    }
    hasTrackedViewRef.current = true;

    analytics.track('plans_viewed', {
      source: 'upgrade',
      // O toggle ainda vai assumir o período da assinatura neste mesmo ciclo.
      billing_period: toBillingPeriod(currentPlan?.billingPeriod ?? type),
      current_plan_id: currentPlan?.planId,
    });
  }, [
    isPendingPlans,
    isGettingCurrentPlan,
    filteredPlans.length,
    type,
    currentPlan?.planId,
    currentPlan?.billingPeriod,
    analytics,
  ]);

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

  const getChangeType = useCallback(
    (priceId: string): TPlanChangeType => {
      if (!currentPlan?.planId) return 'new';

      const index = filteredPlans.findIndex((plan) => plan.priceId === priceId);
      const plan = filteredPlans[index];
      if (plan?.id === currentPlan.planId) return 'interval_change';
      if (currentPlanIndex >= 0 && index < currentPlanIndex) return 'downgrade';
      return 'upgrade';
    },
    [currentPlan?.planId, filteredPlans, currentPlanIndex],
  );

  // O card entrega o `priceId` do Stripe, que é o que a API de assinatura recebe.
  const handleSelectPlan = useCallback(
    (priceId: string) => {
      if (isCancellationScheduled) return;

      const plan = filteredPlans.find((item) => item.priceId === priceId);
      if (plan) {
        const checkout = {
          plan_id: plan.id,
          billing_period: toBillingPeriod(plan.interval),
          value: plan.price / 100,
          currency: plan.currency ?? DEFAULT_PLAN_CURRENCY,
        };
        analytics.track('begin_checkout', {
          ...checkout,
          from_plan_id: currentPlan?.planId,
          change_type: getChangeType(priceId),
        });
        savePendingPurchase(checkout);
      }

      createSubscriptionMutation.mutate(priceId, {
        onSuccess: ({ url }) => {
          if (!url) {
            analytics.track('checkout_failed', {
              reason: 'no_url',
              source: 'upgrade',
            });
            toast.error('Não foi possível abrir o checkout. Tente novamente.');
            return;
          }
          analytics.track('add_payment_info', {
            plan_id: plan?.id,
            price_id: priceId,
          });
          window.location.href = url;
        },
        onError: () => {
          analytics.track('checkout_failed', {
            reason: 'api_error',
            source: 'upgrade',
          });
          toast.error('Não foi possível abrir o checkout. Tente novamente.');
        },
      });
    },
    [
      createSubscriptionMutation,
      isCancellationScheduled,
      filteredPlans,
      currentPlan?.planId,
      getChangeType,
      analytics,
    ],
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
