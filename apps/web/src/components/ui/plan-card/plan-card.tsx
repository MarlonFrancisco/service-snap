import { formatPriceByCountry } from '@/utils/helpers/price.helper';
import { formatPriceByCurrency } from '@repo/shared/formatters';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { usePlanCard } from './plan-card.hook';
import { TPlanCardConfig } from './plan-card.types';

export const PlanCard = ({
  plan,
  index,
  trialPeriodDays,
  isCurrentPlan = false,
  customButtonText,
  onSelectPlan,
  isLoading = false,
  disabled = false,
}: TPlanCardConfig) => {
  const { handleCreateSubscription } = usePlanCard({ priceId: plan.priceId });

  const hasDiscount = plan.discount > 0;
  const hasTrial = trialPeriodDays > 0;
  const priceInReais = plan.price / 100;
  const originalPrice = hasDiscount
    ? priceInReais / (1 - plan.discount / 100)
    : priceInReais;
  const isDisabled = isCurrentPlan || isLoading || disabled;

  const handleClick = () => {
    if (isDisabled) return;
    if (onSelectPlan) {
      onSelectPlan(plan.priceId);
    } else {
      handleCreateSubscription();
    }
  };

  return (
    <motion.div
      key={plan.name}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 + index * 0.08 }}
      className="relative h-full select-none"
    >
      <div
        className={`relative flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm sm:p-8 ${
          plan.popular
            ? 'border-2 border-ink shadow-xl'
            : 'border border-line'
        } ${isCurrentPlan ? 'opacity-80' : ''}`}
      >
        {isCurrentPlan ? (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink-muted px-3 py-1 text-xs font-semibold text-white">
            Plano Atual
          </span>
        ) : plan.popular ? (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
            Mais popular
          </span>
        ) : null}

        <div className="mb-6 sm:mb-8">
          <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
            {plan.name}
          </h3>
          <p className="text-sm text-ink-muted">{plan.description}</p>
        </div>

        <div className="mb-6 sm:mb-8">
          {hasDiscount && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-ink-faint line-through">
                {formatPriceByCountry(originalPrice)}
              </span>
              <span className="rounded-full border border-success/30 px-2 py-0.5 text-xs font-semibold text-success">
                -{plan.discount}%
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-ink">
              {formatPriceByCurrency(priceInReais, plan.currency)}
            </span>
            <span className="text-ink-muted">
              /{plan.interval === 'month' ? 'mês' : 'ano'}
            </span>
          </div>
          {hasTrial && !isCurrentPlan && (
            <p className="mt-2 text-sm text-ink-muted">
              {trialPeriodDays} dias grátis, depois{' '}
              {formatPriceByCountry(priceInReais)}/
              {plan.interval === 'month' ? 'mês' : 'ano'}
            </p>
          )}
        </div>

        <button
          type="button"
          className={`mb-6 w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] sm:mb-8 sm:text-base ${
            isCurrentPlan
              ? 'cursor-not-allowed bg-surface-2 text-ink-faint'
              : plan.popular
                ? 'bg-ink text-white shadow-lg shadow-black/20 hover:bg-ink-hover'
                : 'bg-surface-2 text-ink hover:bg-line'
          }`}
          onClick={handleClick}
          disabled={isDisabled}
        >
          {customButtonText || 'Assinar plano'}
        </button>

        <ul className="mt-auto space-y-3 sm:space-y-4">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
              <span className="text-sm text-ink">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};
