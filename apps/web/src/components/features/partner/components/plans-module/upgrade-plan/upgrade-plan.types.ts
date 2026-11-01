import type { TPricingPlanItem } from '@/components/features/pricing/pricing.types';

export type TUpgradePlanItem = TPricingPlanItem & {
  actionLabel: string;
};
