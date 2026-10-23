import { IPlan } from '@/types/api/payment.types';

export type TPlanCardConfig = {
  plan: IPlan;
  index: number;
  trialPeriodDays: number;
  isCurrentPlan?: boolean;
  customButtonText?: string;
  onSelectPlan?: (priceId: string) => void;
  isLoading?: boolean;
  /** Policy disable (e.g. cancel scheduled) — separate from pending loading. */
  disabled?: boolean;
};
