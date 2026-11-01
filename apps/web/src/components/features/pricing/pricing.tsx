'use client';
import { Footer, Header } from '@/components/layout';
import { PlanCard } from '@/components/ui';
import { Carousel, CarouselContent, CarouselItem } from '@repo/ui';
import { Sparkles } from 'lucide-react';
import { ROICalculator } from '../roi-calculator';
import { BillingToggle } from './billing-toggle';
import { PRICING_BENEFITS } from './pricing.constants';
import { usePricing } from './pricing.hook';

const SECTION =
  'mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-12';

export const Pricing = () => {
  const { plans, monthlyPlans, type, setType, currentPlan, isPendingPlans } =
    usePricing();

  const monthlyPlanPriceInReais = (() => {
    const source =
      monthlyPlans.find((plan) => plan.popular) ?? monthlyPlans[0];
    return source ? source.price / 100 : undefined;
  })();

  return (
    <Header>
      {/* Hero */}
      <section className={`${SECTION} pt-6 pb-4 sm:pt-10 sm:pb-6`}>
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center rounded-full bg-[#F4F4F5] px-3 py-1 text-[10px] font-semibold tracking-wider text-[#0A0A0A] uppercase sm:text-xs">
            Planos
          </span>
          <h1 className="mb-4 text-2xl leading-tight font-bold tracking-tight text-[#0A0A0A] sm:text-3xl lg:text-4xl">
            Preços que crescem com você
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-[#2B2B2B] sm:text-base lg:text-lg">
            Organize agenda, WhatsApp e clientes em um só lugar. Comece com
            teste gratuito e escolha o plano certo para o seu espaço.
          </p>
        </div>
      </section>

      {/* Billing toggle */}
      <section className={`${SECTION} pb-6 sm:pb-8`}>
        <BillingToggle value={type} onChange={setType} />
      </section>

      {/* Plans */}
      <section className={`${SECTION} pb-10 sm:pb-14`}>
        {isPendingPlans ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[28rem] animate-pulse rounded-2xl border border-[#E4E4E7] bg-white shadow-sm"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 xl:grid-cols-4">
              {plans?.map((plan, index) => {
                const isCurrentPlan =
                  plan.id === currentPlan?.planId &&
                  plan.interval === currentPlan?.billingPeriod;

                return (
                  <PlanCard
                    key={`${plan.name}-${plan.interval}`}
                    plan={plan}
                    index={index}
                    trialPeriodDays={plan.trialPeriodDays}
                    isCurrentPlan={isCurrentPlan}
                    customButtonText={
                      isCurrentPlan ? 'Seu plano atual' : undefined
                    }
                  />
                );
              })}
            </div>

            <Carousel
              opts={{
                slidesToScroll: 1,
                active: true,
                align: 'start',
              }}
              className="-mx-4 lg:hidden"
            >
              <CarouselContent className="items-stretch px-4 pt-3">
                {plans?.map((plan, index) => {
                  const isCurrentPlan =
                    plan.id === currentPlan?.planId &&
                    plan.interval === currentPlan?.billingPeriod;

                  return (
                    <CarouselItem
                      key={`${plan.name}-${plan.interval}-mobile`}
                      className="basis-[85%] pl-4 sm:basis-[55%]"
                    >
                      <PlanCard
                        plan={plan}
                        index={index}
                        trialPeriodDays={plan.trialPeriodDays}
                        isCurrentPlan={isCurrentPlan}
                        customButtonText={
                          isCurrentPlan ? 'Seu plano atual' : undefined
                        }
                      />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </>
        )}
      </section>

      {/* Benefits */}
      <section className={`${SECTION} py-10 sm:py-14`}>
        <div className="mb-8 max-w-2xl sm:mb-10">
          <span className="mb-3 inline-flex items-center rounded-full bg-[#F4F4F5] px-3 py-1 text-[10px] font-semibold tracking-wider text-[#0A0A0A] uppercase sm:text-xs">
            Incluso nos planos
          </span>
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl">
            Tudo para multiplicar seus agendamentos
          </h2>
          <p className="text-sm text-[#2B2B2B] sm:text-base">
            Ferramentas pensadas para salões, barbearias e clínicas de estética.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {PRICING_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm transition-shadow hover:shadow-xl sm:p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4F4F5]">
                  <Icon className="h-5 w-5 text-[#0A0A0A]" />
                </div>
                <h3 className="mb-2 text-base font-semibold tracking-tight text-[#0A0A0A] sm:text-lg">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#71717A]">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ROI */}
      <section className={`${SECTION} py-10 sm:py-14`}>
        <div className="mb-8 text-center sm:mb-10">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#F4F4F5] px-3 py-1 text-[10px] font-semibold tracking-wider text-[#0A0A0A] uppercase sm:text-xs">
            <Sparkles className="h-3 w-3" />
            Calculadora de ROI
          </span>
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl lg:text-4xl">
            Calcule seu retorno sobre investimento
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-[#2B2B2B] sm:text-base">
            Veja quanto você pode economizar reduzindo no-shows com ServiceSnap
          </p>
        </div>

        <ROICalculator monthlyPlanPrice={monthlyPlanPriceInReais} />
      </section>

      <Footer />
    </Header>
  );
};
