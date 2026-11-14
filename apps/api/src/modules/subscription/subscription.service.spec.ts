import Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubscriptionService } from './subscription.service';

const CUSTOMER_ID = 'cus_owner';
const USER_ID = 'user-1';

const SESSION = {
  mode: 'subscription',
  customer: CUSTOMER_ID,
  status: 'complete',
  payment_status: 'paid',
  subscription: 'sub_1',
};

const makeService = () => {
  const subscriptionRepository = { findOne: vi.fn().mockResolvedValue(null) };
  const retrieve = vi.fn().mockResolvedValue(SESSION);
  const stripeService = { checkout: { sessions: { retrieve } } };

  const service = new SubscriptionService(
    subscriptionRepository as never,
    {} as never,
    stripeService as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { service, subscriptionRepository, retrieve };
};

describe('SubscriptionService.getCheckoutSessionStatus', () => {
  let ctx: ReturnType<typeof makeService>;

  const check = () =>
    ctx.service.getCheckoutSessionStatus('cs_1', USER_ID, CUSTOMER_ID);

  beforeEach(() => {
    ctx = makeService();
  });

  it('is active once Stripe and the local subscription agree', async () => {
    ctx.subscriptionRepository.findOne.mockResolvedValue({ id: 's' });

    await expect(check()).resolves.toEqual({ status: 'active' });
    expect(ctx.subscriptionRepository.findOne).toHaveBeenCalledWith({
      where: expect.objectContaining({
        subscriptionId: 'sub_1',
        user: { id: USER_ID },
      }),
    });
  });

  it('accepts a trial, which has no payment to collect', async () => {
    ctx.retrieve.mockResolvedValue({
      ...SESSION,
      payment_status: 'no_payment_required',
    });
    ctx.subscriptionRepository.findOne.mockResolvedValue({ id: 's' });

    await expect(check()).resolves.toEqual({ status: 'active' });
  });

  it('waits for the webhook when Stripe is paid but nothing is saved', async () => {
    await expect(check()).resolves.toEqual({ status: 'processing' });
  });

  it("does not validate someone else's session", async () => {
    ctx.retrieve.mockResolvedValue({ ...SESSION, customer: 'cus_other' });

    await expect(check()).resolves.toEqual({ status: 'invalid' });
    expect(ctx.subscriptionRepository.findOne).not.toHaveBeenCalled();
  });

  it('reports an unpaid session as pending', async () => {
    ctx.retrieve.mockResolvedValue({ ...SESSION, payment_status: 'unpaid' });

    await expect(check()).resolves.toEqual({ status: 'pending' });
  });

  it.each([
    ['expired', { status: 'expired' }],
    ['one-off payment', { mode: 'payment' }],
  ])('rejects a %s session', async (_label, overrides) => {
    ctx.retrieve.mockResolvedValue({ ...SESSION, ...overrides });

    await expect(check()).resolves.toEqual({ status: 'invalid' });
  });

  it('treats a made-up session id as invalid', async () => {
    ctx.retrieve.mockRejectedValue(
      new Stripe.errors.StripeInvalidRequestError({
        type: 'invalid_request_error',
        code: 'resource_missing',
        message: 'No such session',
      }),
    );

    await expect(check()).resolves.toEqual({ status: 'invalid' });
  });

  it('does not hide a Stripe outage as an invalid session', async () => {
    ctx.retrieve.mockRejectedValue(new Error('network'));

    await expect(check()).rejects.toThrow('network');
  });
});
