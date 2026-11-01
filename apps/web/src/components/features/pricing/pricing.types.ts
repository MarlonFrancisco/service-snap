import type { IPlan } from '@/types/api/payment.types';

export type TBillingPeriod = IPlan['interval'];

export type TPricingPlanItem = {
  plan: IPlan;
  isCurrentPlan: boolean;
};
