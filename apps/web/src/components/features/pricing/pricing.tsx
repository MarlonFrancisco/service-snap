'use client';
import { Footer, Header } from '@/components/layout';
import { cn } from '@repo/ui';
import { BillingToggle } from './billing-toggle';
import { PricingPlanCard } from './components/pricing-plan-card';
import { PricingRoiCalculator } from './components/pricing-roi-calculator';
import { PricingHero } from './components/pricing-hero';
import {
  PRICING_BENEFITS,
  PRICING_PILL_CLASS,
  PRICING_PLAN_COLUMNS_CLASS,
} from './pricing.constants';
import { PricingPlansSkeleton } from './pricing.skeleton';
import { usePricing } from './pricing.hook';

const SECTION_CLASS = 'pt-14 md:pt-[5.5rem]';
const SECTION_HEAD_CLASS = 'md:mx-auto md:mb-9 md:max-w-[40rem] md:text-center';
const SECTION_TITLE_CLASS =
  'mt-3 text-[1.75rem] leading-[1.12] font-extrabold tracking-[-0.03em] md:mt-3.5 md:text-[2.25rem]';
const SECTION_LEAD_CLASS =
  'mt-3 hidden text-base leading-[1.6] text-ink-muted md:block';

export const Pricing = () => {
  const { planItems, mobilePlanItems, type, setType, isPendingPlans } =
    usePricing();

  return (
    <Header>
      <main className="mx-auto w-full max-w-[82.5rem] px-5 pb-12 md:px-10 md:pb-[5.5rem]">
        <PricingHero>
          <BillingToggle value={type} onChange={setType} />
        </PricingHero>

        <div className="mt-8 md:mt-11">
          {isPendingPlans ? (
            <PricingPlansSkeleton />
          ) : (
            <>
              <div className="grid gap-3.5 md:hidden">
                {mobilePlanItems.map(({ plan, isCurrentPlan }) => (
                  <PricingPlanCard
                    key={plan.priceId}
                    plan={plan}
                    isCurrentPlan={isCurrentPlan}
                  />
                ))}
              </div>
              <div
                className={cn('hidden gap-4 md:grid', PRICING_PLAN_COLUMNS_CLASS)}
              >
                {planItems.map(({ plan, isCurrentPlan }) => (
                  <PricingPlanCard
                    key={plan.priceId}
                    plan={plan}
                    isCurrentPlan={isCurrentPlan}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <section className={SECTION_CLASS}>
          <div className={SECTION_HEAD_CLASS}>
            <span className={PRICING_PILL_CLASS}>Incluso nos planos</span>
            <h2 className={SECTION_TITLE_CLASS}>
              Tudo para multiplicar seus agendamentos
            </h2>
            <p className={SECTION_LEAD_CLASS}>
              Ferramentas pensadas para salões, barbearias e clínicas de
              estética.
            </p>
          </div>

          <div className="mt-[1.375rem] grid gap-[1.125rem] md:mt-0 md:grid-cols-[repeat(auto-fit,minmax(min(21.25rem,100%),1fr))] md:gap-x-10 md:gap-y-8">
            {PRICING_BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className={cn(benefit.desktopOnly && 'hidden md:block')}
              >
                <h3 className="text-base font-bold md:text-[1.0625rem] md:tracking-[-0.01em]">
                  {benefit.title}
                </h3>
                <p className="mt-[0.1875rem] text-sm leading-[1.5] text-ink-muted md:mt-1.5 md:text-[0.9375rem] md:leading-[1.55]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <div className={SECTION_HEAD_CLASS}>
            <span className={PRICING_PILL_CLASS}>Calculadora de ROI</span>
            <h2 className={SECTION_TITLE_CLASS}>
              Calcule seu retorno
              <span className="hidden md:inline"> sobre investimento</span>
            </h2>
            <p className={SECTION_LEAD_CLASS}>
              Veja quanto você pode economizar reduzindo no-shows com o
              ServiceSnap.
            </p>
          </div>

          <div className="mt-[1.375rem] md:mt-0">
            <PricingRoiCalculator />
          </div>
        </section>
      </main>

      <Footer />
    </Header>
  );
};
