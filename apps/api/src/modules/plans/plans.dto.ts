import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import type Stripe from 'stripe';
import { resolvePlanSlug, type TPlanSlug } from '../../utils';

export class PlanDto {
  @IsString()
  id: string;

  @IsString()
  priceId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug: TPlanSlug | null;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsBoolean()
  popular: boolean;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsEnum(['month', 'year'])
  interval: 'month' | 'year';

  @IsNumber()
  discount: number;

  @IsNumber()
  trialPeriodDays: number;

  static fromStripe(
    plan: Stripe.Product,
    price: Stripe.Price,
    subscriptions: Stripe.Subscription[],
  ): PlanDto {
    const hasSubscription = subscriptions.length > 0;
    const dto = new PlanDto();

    dto.id = plan.id;
    dto.priceId = price.id;
    dto.name = plan.name;
    dto.slug = resolvePlanSlug(plan);
    dto.description = plan.description;
    dto.price = price.unit_amount;
    dto.popular = plan.metadata.IS_RECOMMENDED === 'true';
    dto.features = plan.marketing_features.map((feature) => feature.name);
    dto.interval = price.recurring?.interval as 'month' | 'year';
    dto.discount = parseInt(price.metadata.discount || '0');
    dto.trialPeriodDays =
      hasSubscription || dto.interval !== 'month'
        ? 0
        : parseInt(plan.metadata.TRIAL_PERIOD_DAYS || '0');

    return dto;
  }
}
