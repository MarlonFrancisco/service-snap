import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { Store } from '../store.entity';
import { PlanFeatureGuard, type TPlanFeatureFlag } from './plan-feature.guard';

const STORE_ID = 'store-1';

const setup = ({
  required,
  features,
}: {
  required?: TPlanFeatureFlag[];
  features?: Partial<Record<TPlanFeatureFlag, boolean>> | null;
}) => {
  const reflector = {
    getAllAndOverride: vi.fn().mockReturnValue(required),
  } as unknown as Reflector;
  const builder = {
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    getOne: vi.fn().mockResolvedValue(features === null ? null : { features }),
  };
  const subscriptionRepository = {
    createQueryBuilder: vi.fn().mockReturnValue(builder),
  };
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ params: { storeId: STORE_ID } }),
    }),
  } as unknown as ExecutionContext;

  return {
    guard: new PlanFeatureGuard(reflector, subscriptionRepository as never),
    context,
    builder,
    subscriptionRepository,
  };
};

describe('PlanFeatureGuard', () => {
  it('lets routes without plan requirements through without queries', async () => {
    const { guard, context, subscriptionRepository } = setup({});

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(subscriptionRepository.createQueryBuilder).not.toHaveBeenCalled();
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
    const { guard, context, builder } = setup({
      required: ['WHATSAPP_INTEGRATION'],
      features: { WHATSAPP_INTEGRATION: true },
    });

    await guard.canActivate(context);

    // A assinatura vem do dono da loja da rota, nunca de quem fez a chamada
    expect(builder.innerJoin).toHaveBeenCalledWith(
      Store,
      'store',
      'store."ownerId" = subscription."userId"',
    );
    expect(builder.where).toHaveBeenCalledWith('store.id = :storeId', {
      storeId: STORE_ID,
    });
  });
});
