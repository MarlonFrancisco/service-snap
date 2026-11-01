import { usePlanCard } from '@/components/ui/plan-card/plan-card.hook';
import { formatPrice } from '@/utils/helpers/price.helper';
import type { TPricingPlanCardConfig } from './pricing-plan-card.types';

const PRICE_LOCALE = 'pt-BR';
/** A API de planos não envia a moeda, e `formatPrice` assumiria USD. */
const DEFAULT_PLAN_CURRENCY = 'BRL';

export const usePricingPlanCard = ({
  plan,
  isCurrentPlan,
  actionLabel,
  isActionDisabled = false,
  onSelectPlan,
  hideTrial = false,
}: TPricingPlanCardConfig) => {
  const { handleCreateSubscription } = usePlanCard({ priceId: plan.priceId });

  const formatPlanPrice = (value: number) =>
    formatPrice(value, {
      currency: plan.currency ?? DEFAULT_PLAN_CURRENCY,
      locale: PRICE_LOCALE,
    });

  const price = plan.price / 100;
  const hasDiscount = plan.discount > 0;
  const hasTrial = plan.trialPeriodDays > 0 && !isCurrentPlan && !hideTrial;
  const intervalLabel = plan.interval === 'month' ? 'mês' : 'ano';
  const priceLabel = formatPlanPrice(price);

  const handleSubscribe = () => {
    if (onSelectPlan) {
      onSelectPlan(plan.priceId);
      return;
    }

    void handleCreateSubscription();
  };

  return {
    handleSubscribe,
    isDisabled: isCurrentPlan || isActionDisabled,
    priceLabel,
    intervalLabel,
    originalPriceLabel: hasDiscount
      ? formatPlanPrice(price / (1 - plan.discount / 100))
      : null,
    discountLabel: hasDiscount ? `-${plan.discount}%` : null,
    trialLabel: hasTrial
      ? `${plan.trialPeriodDays} dias grátis, depois ${priceLabel}/${intervalLabel}`
      : null,
    badgeLabel: isCurrentPlan
      ? 'Plano atual'
      : plan.popular
        ? 'Mais popular'
        : null,
    actionLabel:
      actionLabel ?? (isCurrentPlan ? 'Seu plano atual' : 'Assinar plano'),
  };
};
