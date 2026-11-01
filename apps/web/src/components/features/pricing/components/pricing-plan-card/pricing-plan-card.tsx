import { cn } from '@repo/ui';
import { usePricingPlanCard } from './pricing-plan-card.hook';
import type { TPricingPlanCardConfig } from './pricing-plan-card.types';

export const PricingPlanCard = ({
  plan,
  isCurrentPlan,
}: TPricingPlanCardConfig) => {
  const {
    handleSubscribe,
    priceLabel,
    intervalLabel,
    originalPriceLabel,
    discountLabel,
    trialLabel,
    badgeLabel,
    actionLabel,
  } = usePricingPlanCard({ plan, isCurrentPlan });

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-3xl md:rounded-[1.625rem]',
        plan.popular
          ? 'border-2 border-[#0B0B0F] px-[1.1875rem] py-[1.4375rem] md:px-[1.4375rem] md:py-[1.6875rem] md:shadow-[0_12px_40px_rgba(15,12,30,0.1)]'
          : 'border border-[#E3E1EA] px-5 py-6 md:px-6 md:py-7',
      )}
    >
      {badgeLabel ? (
        <span
          className={cn(
            'absolute -top-3 left-5 rounded-full px-[0.6875rem] py-[0.3125rem] text-xs font-bold text-white md:top-[-0.8125rem] md:left-6 md:px-3',
            isCurrentPlan ? 'bg-[#5F5C6E]' : 'bg-[#0B0B0F]',
          )}
        >
          {badgeLabel}
        </span>
      ) : null}

      <h2 className="text-[1.1875rem] font-extrabold md:text-xl md:tracking-[-0.02em]">
        {plan.name}
      </h2>
      <p className="mt-1 text-sm leading-[1.5] text-[#5F5C6E] md:mt-1.5 md:min-h-[2.625rem]">
        {plan.description}
      </p>

      {originalPriceLabel ? (
        <p className="mt-3.5 flex items-center gap-2 text-sm text-[#5F5C6E] md:mt-[1.125rem]">
          <span className="line-through">{originalPriceLabel}</span>
          <span className="font-bold text-[#0B0B0F]">{discountLabel}</span>
        </p>
      ) : null}

      <p
        className={cn(
          'text-[1.875rem] font-extrabold tracking-[-0.03em] md:text-[2.125rem]',
          originalPriceLabel ? 'mt-1' : 'mt-3.5 md:mt-[1.125rem]',
        )}
      >
        {priceLabel}{' '}
        <span className="text-sm font-medium tracking-normal text-[#5F5C6E]">
          /{intervalLabel}
        </span>
      </p>

      {trialLabel ? (
        <p className="mt-1.5 text-sm leading-[1.5] text-[#5F5C6E]">
          {trialLabel}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={isCurrentPlan}
        className={cn(
          'order-1 mt-[1.125rem] w-full rounded-full border p-[0.9375rem] text-center text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F] md:order-none',
          isCurrentPlan
            ? 'cursor-not-allowed border-[#E3E1EA] bg-[#F4F3F7] text-[#5F5C6E]'
            : plan.popular
              ? 'cursor-pointer border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]'
              : 'cursor-pointer border-[#0B0B0F] bg-transparent hover:bg-[#F4F3F7]',
        )}
      >
        {actionLabel}
      </button>

      <ul className="mt-4 grid gap-2 text-sm md:mt-[1.375rem] md:gap-2.5 md:border-t md:border-[#F0EEF4] md:pt-5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2 md:gap-[0.5625rem]">
            <span aria-hidden="true" className="font-extrabold">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
