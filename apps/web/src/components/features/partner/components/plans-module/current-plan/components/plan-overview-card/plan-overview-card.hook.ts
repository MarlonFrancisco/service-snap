'use client';

import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { formatPlanDate, formatPlanPrice } from '../../../plans-module.utils';

const UNLIMITED_LABEL = 'Ilimitado';

const getUsageLabel = (current: number, max: number) =>
  max === 0 ? UNLIMITED_LABEL : `${current}/${max}`;

export const usePlanOverviewCard = () => {
  const { currentPlan } = useSubscriptionQuery();

  const priceLabel = currentPlan
    ? formatPlanPrice(currentPlan.price, currentPlan.currency)
    : '';
  const periodLabel = currentPlan?.billingPeriod === 'month' ? 'mês' : 'ano';

  return {
    currentPlan,
    isCancellationScheduled: Boolean(currentPlan?.cancelAtPeriodEnd),
    priceLabel,
    periodLabel,
    formattedNextBillingDate:
      formatPlanDate(currentPlan?.nextBillingDate) ?? 'Indefinida',
    storesUsageLabel: getUsageLabel(
      currentPlan?.storesLength || 0,
      currentPlan?.features.UNIT_LIMIT || 0,
    ),
    usersUsageLabel: getUsageLabel(
      currentPlan?.storeMembersLength || 0,
      currentPlan?.features.PRO_LIMIT || 0,
    ),
  };
};
