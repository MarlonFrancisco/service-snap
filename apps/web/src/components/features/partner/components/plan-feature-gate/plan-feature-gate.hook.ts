'use client';

import { usePlansQuery } from '@/hooks/use-query/use-plans-query';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useCallback, useEffect, useRef } from 'react';
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
  const isLoading = isGettingCurrentPlan && !currentPlan;
  const currentPlanId = currentPlan?.planId;

  const analytics = useAnalytics();
  const trackedModuleRef = useRef<string | null>(null);

  // Uma vez por módulo exibido, só quando o bloqueio aparece de fato.
  useEffect(() => {
    if (isLoading || hasAccess || trackedModuleRef.current === module) return;
    trackedModuleRef.current = module;

    analytics.track('paywall_viewed', {
      module,
      current_plan: currentPlanId,
      min_plan: minPlanName,
    });
  }, [isLoading, hasAccess, module, currentPlanId, minPlanName, analytics]);

  const handleUpgradeClick = useCallback(
    (destination: string) => {
      analytics.track('paywall_upgrade_clicked', { module, destination });
    },
    [module, analytics],
  );

  return {
    lockedModule,
    isLoading,
    handleUpgradeClick,
    hasAccess,
    minPlanName,
    currentPlanName: currentPlan?.planName,
    priceLabel: minPlan
      ? `A partir de ${formatPlanPrice(minPlan.price / 100, minPlan.currency)}/mês.`
      : undefined,
  };
};
