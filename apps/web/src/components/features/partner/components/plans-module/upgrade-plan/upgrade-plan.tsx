'use client';

import { BillingToggle } from '@/components/features/pricing/billing-toggle';
import { ROICalculator } from '@/components/features/roi-calculator';
import { PlanCard } from '@/components/ui';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@repo/ui';
import { Crown, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useUpgradePlan } from './upgrade-plan.hook';
import { UpgradePlanSkeleton } from './upgrade-plan.skeleton';

export function UpgradePlan() {
  const {
    plans,
    benefits,
    currentPlan,
    currentPlanIndex,
    isOnHighestPlan,
    isCancellationScheduled,
    isPendingPlans,
    isCreatingSubscription,
    handleSelectPlan,
    type,
    setType,
  } = useUpgradePlan();

  if (isPendingPlans) {
    return <UpgradePlanSkeleton />;
  }

  return (
    <div className="space-y-12">
      {isCancellationScheduled && (
        <Alert className="border-orange-200 bg-orange-50 text-orange-900">
          <Crown className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <p className="font-medium text-orange-900 mb-1">
              Cancelamento agendado no plano {currentPlan?.planName}
            </p>
            <p className="text-sm mb-3">
              Enquanto o cancelamento estiver marcado, não iniciamos um novo
              upgrade/checkout. Reative o plano atual primeiro (ou espere o fim
              do ciclo) para evitar cobranças e estados contraditórios.
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-orange-300 bg-white text-orange-900 hover:bg-orange-100"
            >
              <Link href="/partner/plans/me">Ir ao meu plano para reativar</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isCancellationScheduled && (
        <Alert className="bg-gradient-to-r from-gray-50 to-white border-gray-200">
          <Crown className="h-5 w-5" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="text-gray-900">
                Você está no plano <strong>{currentPlan?.planName}</strong>
              </p>
              <p className="text-sm text-gray-600">
                {isOnHighestPlan
                  ? 'Este já é o plano mais completo disponível neste ciclo de cobrança.'
                  : 'Escolha um plano superior para desbloquear mais recursos. Cancelar o plano atual é feito em “Meu plano”, não aqui.'}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <BillingToggle value={type} onChange={setType} />
      </div>

      <div className="max-w-7xl mx-auto">
        <Carousel
          opts={{
            slidesToScroll: 1,
            active: true,
            align: 'start',
          }}
          className="-mx-4"
        >
          <CarouselContent className="pt-3 px-4 items-stretch">
            {plans?.map((plan, index) => {
              const isCurrentPlan =
                plan.id === currentPlan?.planId &&
                plan.interval === currentPlan?.billingPeriod;
              const isSameTierDifferentInterval =
                plan.id === currentPlan?.planId &&
                plan.interval !== currentPlan?.billingPeriod;
              const isUpgrade =
                currentPlanIndex >= 0 ? index > currentPlanIndex : true;
              const isDowngrade =
                currentPlanIndex >= 0 ? index < currentPlanIndex : false;

              const buttonText = isCurrentPlan
                ? 'Seu plano atual'
                : isCancellationScheduled
                  ? 'Reative o plano atual primeiro'
                  : isSameTierDifferentInterval
                    ? `Mudar para ${plan.interval === 'month' ? 'mensal' : 'anual'}`
                    : isUpgrade
                      ? 'Fazer upgrade'
                      : isDowngrade
                        ? 'Mudar para este plano'
                        : 'Assinar plano';

              return (
                <CarouselItem
                  key={`${plan.id}-${plan.interval}`}
                  className="pl-4 basis-[85%] sm:basis-[55%] lg:basis-1/3"
                >
                  <PlanCard
                    plan={plan}
                    index={index}
                    isCurrentPlan={isCurrentPlan}
                    customButtonText={buttonText}
                    onSelectPlan={handleSelectPlan}
                    isLoading={isCreatingSubscription}
                    disabled={isCancellationScheduled}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>

      {!isOnHighestPlan && !isCancellationScheduled && (
        <>
          <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 rounded-2xl p-8 border-gray-200">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="outline" className="border-gray-200 mb-4">
                  <Sparkles className="w-3 h-3 mr-1 inline" />
                  Calculadora de ROI
                </Badge>
                <h2 className="text-3xl text-gray-900 mb-4">
                  Calcule seu retorno sobre investimento
                </h2>
                <p className="text-lg text-gray-600">
                  Veja quanto você pode economizar reduzindo no-shows com
                  ServiceSnap
                </p>
              </div>

              <ROICalculator />
            </div>
          </div>

          <div>
            <div className="text-center mb-16">
              <h2 className="text-3xl text-gray-900 mb-4">
                Por que fazer upgrade?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Desbloqueie recursos poderosos e leve seu negócio ao próximo
                nível
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-gray-200 p-6 h-full hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                      <Sparkles className="w-6 h-6 text-gray-900" />
                    </div>
                    <h3 className="text-xl text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
