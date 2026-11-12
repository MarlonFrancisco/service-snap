import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../../subscription/subscription.entity';
import { Store } from '../store.entity';

export type TPlanFeatureFlag = keyof Pick<
  Subscription['features'],
  | 'DASHBOARD_GENERAL_ACCESS'
  | 'DASHBOARD_SALES_ACCESS'
  | 'DASHBOARD_OPERATIONAL_ACCESS'
  | 'DASHBOARD_CUSTOMERS_ACCESS'
  | 'WHATSAPP_INTEGRATION'
>;

export const PLAN_FEATURES_KEY = 'requiredPlanFeatures';

/** Todas as flags precisam estar no plano do dono da loja. */
export const RequiresPlanFeatures = (...features: TPlanFeatureFlag[]) =>
  SetMetadata(PLAN_FEATURES_KEY, features);

export const PLAN_FEATURE_REQUIRED = 'PLAN_FEATURE_REQUIRED';

const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'paid', 'trialing'];

/**
 * Vem depois de `StoreAccessGuard`: o plano é do dono da loja, porque quem chama
 * pode ser um gerente ou profissional sem assinatura (como em `PRO_LIMIT`).
 */
@Injectable()
export class PlanFeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<TPlanFeatureFlag[]>(
      PLAN_FEATURES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ params?: { storeId?: string } }>();
    const storeId = request.params?.storeId;
    const missing = await this.getMissingFeatures(storeId, required);

    if (missing.length) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        code: PLAN_FEATURE_REQUIRED,
        message:
          'Este recurso não está incluído no seu plano. Faça upgrade para liberar o acesso.',
        missingFeatures: missing,
      });
    }

    return true;
  }

  async getMissingFeatures(
    storeId: string | undefined,
    required: readonly TPlanFeatureFlag[],
  ): Promise<TPlanFeatureFlag[]> {
    if (!storeId) {
      return [...required];
    }

    // Uma ida ao banco: a assinatura ativa do dono sai do join com a loja, em
    // vez de buscar o dono primeiro e a assinatura depois.
    const subscription = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .innerJoin(Store, 'store', 'store."ownerId" = subscription."userId"')
      .where('store.id = :storeId', { storeId })
      .andWhere('subscription.status IN (:...statuses)', {
        statuses: ACTIVE_SUBSCRIPTION_STATUSES,
      })
      .andWhere('subscription."currentPeriodEnd" >= :now', { now: new Date() })
      .getOne();

    return required.filter((flag) => subscription?.features?.[flag] !== true);
  }
}
