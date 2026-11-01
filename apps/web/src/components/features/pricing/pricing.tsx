'use client';
import { Footer, Header } from '@/components/layout';
import { cn } from '@repo/ui';
import { BillingToggle } from './billing-toggle';
import { PricingPlanCard } from './components/pricing-plan-card';
import { PricingRoiCalculator } from './components/pricing-roi-calculator';
import { PRICING_BENEFITS } from './pricing.constants';
import { usePricing } from './pricing.hook';

const PILL_CLASS =
  'inline-block rounded-full bg-[#F4F3F7] px-3 py-[0.4375rem] text-[0.6875rem] font-bold tracking-[0.06em] uppercase md:px-3.5 md:py-2 md:text-xs';
const SECTION_CLASS = 'pt-14 md:pt-[5.5rem]';
const SECTION_HEAD_CLASS = 'md:mx-auto md:mb-9 md:max-w-[40rem] md:text-center';
const SECTION_TITLE_CLASS =
  'mt-3 text-[1.75rem] leading-[1.12] font-extrabold tracking-[-0.03em] md:mt-3.5 md:text-[2.25rem]';
const SECTION_LEAD_CLASS =
  'mt-3 hidden text-base leading-[1.6] text-[#5F5C6E] md:block';
const PLAN_COLUMNS_CLASS =
  'md:grid-cols-[repeat(auto-fit,minmax(min(16.25rem,100%),1fr))]';

export const Pricing = () => {
  const { planItems, mobilePlanItems, type, setType, isPendingPlans } =
    usePricing();

  return (
    <Header>
      <main className="mx-auto w-full max-w-[82.5rem] px-5 pb-12 md:px-10 md:pb-[5.5rem]">
        <div className="mx-auto max-w-[45rem] pt-4 text-center md:pt-10">
          <span className={PILL_CLASS}>Planos</span>
          <h1 className="mt-3.5 text-[2.125rem] leading-[1.08] font-extrabold tracking-[-0.035em] md:mt-4 md:text-[3rem]">
            Preços que crescem com você
          </h1>
          <p className="mt-3 text-[0.9375rem] leading-[1.6] text-[#5F5C6E] md:mt-4 md:text-[1.0625rem]">
            Organize agenda, WhatsApp e clientes em um só lugar. Comece com
            teste gratuito e escolha o plano certo para o seu espaço.
          </p>
          <div className="mt-5 md:mt-7">
            <BillingToggle value={type} onChange={setType} />
          </div>
        </div>

        <div className="mt-8 md:mt-11">
          {isPendingPlans ? (
            <div
              aria-hidden="true"
              className={cn('grid gap-3.5 md:gap-4', PLAN_COLUMNS_CLASS)}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[28rem] animate-pulse rounded-3xl border border-[#E3E1EA] bg-white md:rounded-[1.625rem]"
                />
              ))}
            </div>
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
                className={cn('hidden gap-4 md:grid', PLAN_COLUMNS_CLASS)}
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
            <span className={PILL_CLASS}>Incluso nos planos</span>
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
                <p className="mt-[0.1875rem] text-sm leading-[1.5] text-[#5F5C6E] md:mt-1.5 md:text-[0.9375rem] md:leading-[1.55]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <div className={SECTION_HEAD_CLASS}>
            <span className={PILL_CLASS}>Calculadora de ROI</span>
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
