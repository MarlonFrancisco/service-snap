import { usePlansQuery } from '@/hooks/use-query/use-plans-query';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useMemo, useState } from 'react';
import type { TBillingPeriod, TPricingPlanItem } from './pricing.types';

export const usePricing = () => {
  const { data, isPendingPlans } = usePlansQuery();
  const { currentPlan } = useSubscriptionQuery();

  const [type, setType] = useState<TBillingPeriod>('month');

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

  return {
    planItems,
    mobilePlanItems,
    isPendingPlans,
    type,
    setType,
  };
};
