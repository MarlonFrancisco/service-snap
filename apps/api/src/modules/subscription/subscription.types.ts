export type TSubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'
  | 'draft'
  | 'open'
  | 'paid';

export type TCheckoutSessionStatus =
  | 'active'
  | 'processing'
  | 'pending'
  | 'invalid';
