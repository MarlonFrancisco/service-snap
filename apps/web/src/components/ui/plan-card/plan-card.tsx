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
            ? 'border-2 border-[#0A0A0A] shadow-xl'
            : 'border border-[#E4E4E7]'
        } ${isCurrentPlan ? 'opacity-80' : ''}`}
      >
        {isCurrentPlan ? (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#71717A] px-3 py-1 text-xs font-semibold text-white">
            Plano Atual
          </span>
        ) : plan.popular ? (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0A0A0A] px-3 py-1 text-xs font-semibold text-white">
            Mais popular
          </span>
        ) : null}

        <div className="mb-6 sm:mb-8">
          <h3 className="mb-2 text-xl font-semibold tracking-tight text-[#0A0A0A]">
            {plan.name}
          </h3>
          <p className="text-sm text-[#71717A]">{plan.description}</p>
        </div>

        <div className="mb-6 sm:mb-8">
          {hasDiscount && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-[#A1A1AA] line-through">
                {formatPriceByCountry(originalPrice)}
              </span>
              <span className="rounded-full border border-[#047857]/30 px-2 py-0.5 text-xs font-semibold text-[#047857]">
                -{plan.discount}%
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-[#0A0A0A]">
              {formatPriceByCurrency(priceInReais, plan.currency)}
            </span>
            <span className="text-[#71717A]">
              /{plan.interval === 'month' ? 'mês' : 'ano'}
            </span>
          </div>
          {hasTrial && !isCurrentPlan && (
            <p className="mt-2 text-sm text-[#71717A]">
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
              ? 'cursor-not-allowed bg-[#F4F4F5] text-[#A1A1AA]'
              : plan.popular
                ? 'bg-[#0A0A0A] text-white shadow-lg shadow-black/20 hover:bg-[#2B2B2B]'
                : 'bg-[#F4F4F5] text-[#0A0A0A] hover:bg-[#E4E4E7]'
          }`}
          onClick={handleClick}
          disabled={isDisabled}
        >
          {customButtonText || 'Assinar plano'}
        </button>

        <ul className="mt-auto space-y-3 sm:space-y-4">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#0A0A0A]" />
              <span className="text-sm text-[#2B2B2B]">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};
