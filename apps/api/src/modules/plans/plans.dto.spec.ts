import type Stripe from 'stripe';
import { describe, expect, it } from 'vitest';
import { PlanDto } from './plans.dto';

const product = {
  id: 'prod_1',
  name: 'Starter',
  description: '',
  metadata: { TRIAL_PERIOD_DAYS: '30' },
  marketing_features: [],
} as unknown as Stripe.Product;

const price = (interval: 'month' | 'year') =>
  ({
    id: `price_${interval}`,
    unit_amount: 3990,
    metadata: {},
    recurring: { interval },
  }) as unknown as Stripe.Price;

describe('PlanDto.fromStripe', () => {
  it('offers the trial on the monthly price', () => {
    expect(
      PlanDto.fromStripe(product, price('month'), []).trialPeriodDays,
    ).toBe(30);
  });

  it('offers no trial on the annual price', () => {
    expect(PlanDto.fromStripe(product, price('year'), []).trialPeriodDays).toBe(
      0,
    );
  });

  it('offers no trial to a customer who already subscribed', () => {
    const subscriptions = [{ id: 'sub_1' }] as Stripe.Subscription[];

    expect(
      PlanDto.fromStripe(product, price('month'), subscriptions)
        .trialPeriodDays,
    ).toBe(0);
  });
});

describe('PlanDto.fromStripe slug', () => {
  const withProduct = (overrides: Partial<Stripe.Product>) =>
    PlanDto.fromStripe(
      { ...product, ...overrides } as Stripe.Product,
      price('month'),
      [],
    ).slug;

  it('uses the plan_slug metadata, whatever the visible name', () => {
    expect(
      withProduct({ name: 'Equipe', metadata: { plan_slug: 'team' } }),
    ).toBe('team');
  });

  it('falls back to the current Stripe name without metadata', () => {
    expect(withProduct({ name: 'Starter', metadata: {} })).toBe('solo');
    expect(withProduct({ name: 'Professional', metadata: {} })).toBe('team');
    expect(withProduct({ name: 'Business', metadata: {} })).toBe('multi');
    expect(withProduct({ name: 'Enterprise', metadata: {} })).toBe(
      'enterprise',
    );
  });

  it('ignores an unknown slug and an unknown name', () => {
    expect(withProduct({ name: 'Outro', metadata: { plan_slug: 'x' } })).toBe(
      null,
    );
  });
});
