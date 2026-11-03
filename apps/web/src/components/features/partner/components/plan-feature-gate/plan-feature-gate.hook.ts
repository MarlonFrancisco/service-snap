'use client';

import { usePlansQuery } from '@/hooks/use-query/use-plans-query';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { formatPlanPrice } from '../plans-module/plans-module.utils';
import {
  getMinPlanName,
  hasPlanAccess,
  LOCKED_MODULES,
} from './plan-feature-gate.constants';
import type { TUsePlanFeatureGateConfig } from './plan-feature-gate.types';

export const usePlanFeatureGate = ({ module }: TUsePlanFeatureGateConfig) => {
  const lockedModule = LOCKED_MODULES[module];
  const { currentPlan, isGettingCurrentPlan } = useSubscriptionQuery();
  const features = currentPlan?.features;
  const hasAccess = hasPlanAccess(lockedModule.requires, features);
  const minPlanName = hasAccess
    ? undefined
    : getMinPlanName(lockedModule.requires, features);

  // Só busca preços quando o aviso aparece.
  const { data: plans } = usePlansQuery({ enabled: !hasAccess });
  const minPlan = plans?.month.find((plan) => plan.name === minPlanName);

  return {
    lockedModule,
    isLoading: isGettingCurrentPlan && !currentPlan,
    hasAccess,
    minPlanName,
    currentPlanName: currentPlan?.planName,
    priceLabel: minPlan
      ? `A partir de ${formatPlanPrice(minPlan.price / 100, minPlan.currency)}/mês.`
      : undefined,
  };
};
