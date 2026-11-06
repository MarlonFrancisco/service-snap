import { usePlansQuery } from '@/hooks/use-query/use-plans-query';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { toBillingPeriod } from '@/utils/helpers/analytics.helper';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TBillingPeriod, TPricingPlanItem } from './pricing.types';

export const usePricing = () => {
  const { data, isPendingPlans } = usePlansQuery();
  const { currentPlan } = useSubscriptionQuery();

  const [type, setType] = useState<TBillingPeriod>('month');
  const analytics = useAnalytics();
  const hasTrackedViewRef = useRef(false);

  const planItems = useMemo<TPricingPlanItem[]>(() => {
    return (data?.[type] ?? []).map((plan) => ({
      plan,
      isCurrentPlan:
        plan.id === currentPlan?.planId &&
        plan.interval === currentPlan?.billingPeriod,
    }));
  }, [data, type, currentPlan?.planId, currentPlan?.billingPeriod]);

  const mobilePlanItems = useMemo<TPricingPlanItem[]>(() => {
    return [...planItems].sort(
      (a, b) => Number(b.plan.popular) - Number(a.plan.popular),
    );
  }, [planItems]);

  // Uma vez por visita, quando os planos chegam.
  useEffect(() => {
    if (hasTrackedViewRef.current || isPendingPlans || !planItems.length) return;
    hasTrackedViewRef.current = true;

    const billingPeriod = toBillingPeriod(type);
    analytics.track('plans_viewed', {
      source: 'pricing',
      billing_period: billingPeriod,
      current_plan_id: currentPlan?.planId,
    });
    analytics.track('view_item_list', {
      item_list_name: `pricing_${billingPeriod}`,
      results_count: planItems.length,
      item_ids: planItems.map(({ plan }) => plan.id),
    });
  }, [isPendingPlans, planItems, type, currentPlan?.planId, analytics]);

  const handleSetType = useCallback(
    (next: TBillingPeriod) => {
      if (next === type) return;
      analytics.track('billing_period_toggled', {
        billing_period: toBillingPeriod(next),
        source: 'pricing',
      });
      setType(next);
    },
    [type, analytics],
  );

  return {
    planItems,
    mobilePlanItems,
    isPendingPlans,
    type,
    setType: handleSetType,
  };
};
