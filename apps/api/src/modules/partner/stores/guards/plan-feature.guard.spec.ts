import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { PlanFeatureGuard, type TPlanFeatureFlag } from './plan-feature.guard';

const STORE_ID = 'store-1';

const setup = ({
  required,
  features,
  store = { id: STORE_ID, owner: { id: 'owner-1' } },
}: {
  required?: TPlanFeatureFlag[];
  features?: Partial<Record<TPlanFeatureFlag, boolean>> | null;
  store?: unknown;
}) => {
  const reflector = {
    getAllAndOverride: vi.fn().mockReturnValue(required),
  } as unknown as Reflector;
  const storeRepository = { findOne: vi.fn().mockResolvedValue(store) };
  const subscriptionRepository = {
    findOne: vi.fn().mockResolvedValue(features === null ? null : { features }),
  };
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ params: { storeId: STORE_ID } }),
    }),
  } as unknown as ExecutionContext;

  return {
    guard: new PlanFeatureGuard(
      reflector,
      storeRepository as never,
      subscriptionRepository as never,
    ),
    context,
    storeRepository,
    subscriptionRepository,
  };
};

describe('PlanFeatureGuard', () => {
  it('lets routes without plan requirements through without queries', async () => {
    const { guard, context, storeRepository } = setup({});

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(storeRepository.findOne).not.toHaveBeenCalled();
  });

  it('allows the route when the owner plan has every feature', async () => {
    const { guard, context } = setup({
      required: ['DASHBOARD_GENERAL_ACCESS', 'DASHBOARD_SALES_ACCESS'],
      features: {
        DASHBOARD_GENERAL_ACCESS: true,
        DASHBOARD_SALES_ACCESS: true,
      },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('blocks the route and names the missing features', async () => {
    const { guard, context } = setup({
      required: ['DASHBOARD_GENERAL_ACCESS', 'DASHBOARD_SALES_ACCESS'],
      features: { DASHBOARD_GENERAL_ACCESS: true },
    });

    const error = await guard.canActivate(context).catch((e) => e);

    expect(error).toBeInstanceOf(ForbiddenException);
    expect(error.getResponse()).toMatchObject({
      code: 'PLAN_FEATURE_REQUIRED',
      missingFeatures: ['DASHBOARD_SALES_ACCESS'],
    });
  });

  it('blocks when the owner has no active subscription', async () => {
    const { guard, context } = setup({
      required: ['WHATSAPP_INTEGRATION'],
      features: null,
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('reads the plan of the store owner, not of the caller', async () => {
    const { guard, context, subscriptionRepository } = setup({
      required: ['WHATSAPP_INTEGRATION'],
      features: { WHATSAPP_INTEGRATION: true },
    });

    await guard.canActivate(context);

    expect(subscriptionRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user: { id: 'owner-1' } }),
      }),
    );
  });
});
