import type Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StripeService } from '../stripe';
import { PlansService } from './plans.service';

const product = {
  id: 'prod_team',
  name: 'Professional',
  description: '',
  metadata: { TRIAL_PERIOD_DAYS: '14', plan_slug: 'team' },
  marketing_features: [],
} as unknown as Stripe.Product;

const price = (overrides: Partial<Stripe.Price> = {}) =>
  ({
    id: 'price_month',
    product: 'prod_team',
    currency: 'brl',
    unit_amount: 7990,
    metadata: {},
    recurring: { interval: 'month' },
    currency_options: {
      brl: { unit_amount: 7990 },
      eur: { unit_amount: 2990 },
    },
    ...overrides,
  }) as unknown as Stripe.Price;

const createStripe = (customerCurrency: string | null = null) => ({
  subscriptions: { list: vi.fn().mockResolvedValue({ data: [] }) },
  customers: {
    retrieve: vi.fn().mockResolvedValue({ currency: customerCurrency }),
  },
  products: { list: vi.fn().mockResolvedValue({ data: [product] }) },
  prices: { list: vi.fn().mockResolvedValue({ data: [price()] }) },
});

const findAll = (
  stripe: ReturnType<typeof createStripe>,
  customerId?: string,
) => new PlansService(stripe as unknown as StripeService).findAll(customerId);

describe('PlansService.findAll', () => {
  let stripe: ReturnType<typeof createStripe>;

  beforeEach(() => {
    stripe = createStripe();
  });

  it('lists every currency, with no currency fixed in the code', async () => {
    await findAll(stripe);

    expect(stripe.prices.list).toHaveBeenCalledWith({
      active: true,
      limit: 100,
      expand: ['data.currency_options'],
    });
  });

  it('shows the default currency of the price before login', async () => {
    const plans = await findAll(stripe);

    expect(plans.month[0]).toMatchObject({ currency: 'BRL', price: 7990 });
  });

  it('does not read the account subscriptions without a customer', async () => {
    const plans = await findAll(stripe);

    expect(stripe.subscriptions.list).not.toHaveBeenCalled();
    expect(stripe.customers.retrieve).not.toHaveBeenCalled();
    expect(plans.month[0].trialPeriodDays).toBe(14);
  });

  it('uses the customer currency from currency_options', async () => {
    stripe = createStripe('eur');

    const plans = await findAll(stripe, 'cus_1');

    expect(stripe.subscriptions.list).toHaveBeenCalledWith({
      customer: 'cus_1',
      limit: 1,
    });
    expect(plans.month[0]).toMatchObject({ currency: 'EUR', price: 2990 });
  });

  it('keeps a BRL customer in BRL', async () => {
    stripe = createStripe('brl');

    const plans = await findAll(stripe, 'cus_1');

    expect(plans.month[0]).toMatchObject({ currency: 'BRL', price: 7990 });
  });

  it('falls back to the default currency, without converting, when the price lacks the customer one', async () => {
    stripe = createStripe('usd');

    const plans = await findAll(stripe, 'cus_1');

    expect(plans.month[0]).toMatchObject({ currency: 'BRL', price: 7990 });
  });

  it('falls back to the default currency when the customer cannot be read', async () => {
    stripe.customers.retrieve.mockRejectedValue(new Error('No such customer'));

    const plans = await findAll(stripe, 'cus_gone');

    expect(plans.month[0].currency).toBe('BRL');
  });

  it('keeps one card per plan and interval when an old price in another currency exists', async () => {
    stripe.prices.list.mockResolvedValue({
      data: [price(), price({ id: 'price_old_usd', currency: 'usd' })],
    });

    const plans = await findAll(stripe);

    expect(plans.month.map((plan) => plan.priceId)).toEqual(['price_month']);
  });
});
