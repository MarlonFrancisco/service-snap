import { usePlansQuery } from '@/hooks/use-query/use-plans-query';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useMemo, useState } from 'react';

export const usePricing = () => {
  const { data, isPendingPlans } = usePlansQuery();
  const { currentPlan } = useSubscriptionQuery();

  const [type, setType] = useState<'month' | 'year'>('month');

  const filteredPlans = useMemo(() => {
    return data?.[type] || [];
  }, [data, type]);

  return {
    plans: filteredPlans,
    monthlyPlans: data?.month ?? [],
    isPendingPlans,
    type,
    setType,
    currentPlan,
  };
};
