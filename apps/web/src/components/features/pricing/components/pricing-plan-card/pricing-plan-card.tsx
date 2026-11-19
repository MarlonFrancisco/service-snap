import { cn } from '@repo/ui';
import { usePricingPlanCard } from './pricing-plan-card.hook';
import type { TPricingPlanCardConfig } from './pricing-plan-card.types';

export const PricingPlanCard = (config: TPricingPlanCardConfig) => {
  const { plan, isCurrentPlan } = config;
  const {
    handleSubscribe,
    isDisabled,
    priceLabel,
    intervalLabel,
    originalPriceLabel,
    discountLabel,
    trialLabel,
    badgeLabel,
    actionLabel,
  } = usePricingPlanCard(config);

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-3xl md:rounded-[1.625rem]',
        plan.popular
          ? 'border-2 border-ink px-[1.1875rem] py-[1.4375rem] md:px-[1.4375rem] md:py-[1.6875rem] md:shadow-[0_12px_40px_rgba(15,12,30,0.1)]'
          : 'border border-line-strong px-5 py-6 md:px-6 md:py-7',
      )}
    >
      {badgeLabel ? (
        <span
          className={cn(
            'absolute -top-3 left-5 rounded-full px-[0.6875rem] py-[0.3125rem] text-xs font-bold text-white md:top-[-0.8125rem] md:left-6 md:px-3',
            isCurrentPlan ? 'bg-ink-muted' : 'bg-ink',
          )}
        >
          {badgeLabel}
        </span>
      ) : null}

      <h2 className="text-[1.1875rem] font-extrabold md:text-xl md:tracking-[-0.02em]">
        {plan.name}
      </h2>
      <p className="mt-1 text-sm leading-[1.5] text-ink-muted md:mt-1.5 md:min-h-[2.625rem]">
        {plan.description}
      </p>

      {originalPriceLabel ? (
        <p className="mt-3.5 flex items-center gap-2 text-sm text-ink-muted md:mt-[1.125rem]">
          <span className="line-through">{originalPriceLabel}</span>
          <span className="font-bold text-ink">{discountLabel}</span>
        </p>
      ) : null}

      <p
        className={cn(
          'text-[1.875rem] font-extrabold tracking-[-0.03em] md:text-[2.125rem]',
          originalPriceLabel ? 'mt-1' : 'mt-3.5 md:mt-[1.125rem]',
        )}
      >
        {priceLabel}{' '}
        <span className="text-sm font-medium tracking-normal text-ink-muted">
          /{intervalLabel}
        </span>
      </p>

      {trialLabel ? (
        <p className="mt-1.5 text-sm leading-[1.5] text-ink-muted">
          {trialLabel}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={isDisabled}
        className={cn(
          'order-1 mt-[1.125rem] w-full rounded-full border p-[0.9375rem] text-center text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:order-none',
          isDisabled
            ? 'cursor-not-allowed border-line-strong bg-surface-2 text-ink-muted'
            : plan.popular
              ? 'cursor-pointer border-brand bg-brand text-white hover:bg-brand-hover'
              : 'cursor-pointer border-ink bg-transparent hover:bg-surface-2',
        )}
      >
        {actionLabel}
      </button>

      <ul className="mt-4 grid gap-2 text-sm md:mt-[1.375rem] md:gap-2.5 md:border-t md:border-surface-3 md:pt-5">
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
