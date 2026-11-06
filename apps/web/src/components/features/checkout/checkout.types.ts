import type { TBillingPeriod } from '@repo/analytics';

export type TCheckoutStatus =
  | 'invalid'
  | 'validating'
  | 'delayed'
  | 'error'
  | 'success';

/** Plano guardado ao iniciar o checkout, lido no retorno do Stripe. */
export type TPendingPurchase = {
  plan_id: string;
  billing_period: TBillingPeriod;
  value: number;
  currency: string;
};
