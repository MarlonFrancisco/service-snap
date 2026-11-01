'use client';

import { BillingToggle } from '@/components/features/pricing/billing-toggle';
import { PricingPlanCard } from '@/components/features/pricing/components/pricing-plan-card';
import { PricingRoiCalculator } from '@/components/features/pricing/components/pricing-roi-calculator';
import { cn } from '@repo/ui';
import Link from 'next/link';
import { ModuleErrorState } from '../../notifications-module/components/module-state';
import { MODULE_ACTION_CLASS } from '../../notifications-module/notifications-module.styles';
import { useUpgradePlan } from './upgrade-plan.hook';
import { UpgradePlanSkeleton } from './upgrade-plan.skeleton';

export function UpgradePlan() {
  const {
    planItems,
    currentPlan,
    isOnHighestPlan,
    isCancellationScheduled,
    isPendingPlans,
    isErrorPlans,
    isFetchingPlans,
    refetchPlans,
    isCreatingSubscription,
    handleSelectPlan,
    type,
    setType,
  } = useUpgradePlan();

  if (isPendingPlans) {
    return <UpgradePlanSkeleton />;
  }

  if (isErrorPlans) {
    return (
      <ModuleErrorState
        onRetry={() => void refetchPlans()}
        isRetrying={isFetchingPlans}
      />
    );
  }

  return (
    <div className="grid gap-[22px]">
      {isCancellationScheduled ? (
        <div className="rounded-[14px] bg-[#FFF1E0] px-[18px] py-3.5 text-sm leading-normal text-[#6E3B00]">
          <strong className="block">
            Cancelamento agendado no plano {currentPlan?.planName}
          </strong>
          Enquanto o cancelamento estiver marcado, não iniciamos um novo
          upgrade. Reative o plano atual primeiro ou espere o fim do ciclo.
          <Link
            href="/partner/plans/me"
            className={cn(MODULE_ACTION_CLASS, 'mt-2.5 flex w-fit')}
          >
            Ir ao meu plano para reativar
          </Link>
        </div>
      ) : (
        <p className="rounded-[14px] bg-[#F7F6FA] px-[18px] py-3.5 text-sm leading-normal">
          <strong>Você está no plano {currentPlan?.planName}.</strong>{' '}
          {isOnHighestPlan
            ? 'Este já é o plano mais completo disponível neste ciclo de cobrança.'
            : 'Mude de plano quando precisar de mais lojas ou profissionais.'}
        </p>
      )}

      <div className="flex justify-center">
        <BillingToggle value={type} onChange={setType} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3.5 pt-1.5">
        {planItems.map(({ plan, isCurrentPlan, actionLabel }) => (
          <PricingPlanCard
            key={`${plan.id}-${plan.interval}`}
            plan={plan}
            isCurrentPlan={isCurrentPlan}
            actionLabel={actionLabel}
            isActionDisabled={isCreatingSubscription || isCancellationScheduled}
            onSelectPlan={handleSelectPlan}
            hideTrial
          />
        ))}
      </div>

      {!isOnHighestPlan && !isCancellationScheduled ? (
        <>
          <div className="text-center">
            <h2 className="text-[28px] leading-tight font-extrabold tracking-[-0.03em]">
              Calcule seu retorno sobre investimento
            </h2>
            <p className="mt-1.5 text-[15px] text-[#5F5C6E]">
              Veja quanto você pode economizar reduzindo no-shows com o
              ServiceSnap.
            </p>
          </div>

          <PricingRoiCalculator />
        </>
      ) : null}
    </div>
  );
}
