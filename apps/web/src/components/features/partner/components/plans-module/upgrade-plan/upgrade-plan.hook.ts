import { useSubscriptionMutations } from '@/hooks';
import { usePlansQuery } from '@/hooks/use-query/use-plans-query';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useCallback, useMemo, useState } from 'react';

const benefits = [
  {
    title: 'Aumente sua eficiência',
    description:
      'Automatize agendamentos e reduza no-shows em até 80% com lembretes inteligentes.',
  },
  {
    title: 'Cresça mais rápido',
    description:
      'Empresas que usam ServiceSnap crescem 3x mais rápido com agendamentos online 24/7.',
  },
  {
    title: 'Fidelize clientes',
    description:
      'Experiência premium de agendamento que seus clientes vão amar e recomendar.',
  },
  {
    title: 'Segurança garantida',
    description:
      'Seus dados e dos seus clientes protegidos com criptografia de ponta a ponta.',
  },
  {
    title: 'Economize tempo',
    description:
      'Reduza em até 15 horas semanais gastas com gestão de agendamentos manuais.',
  },
  {
    title: 'Insights poderosos',
    description:
      'Tome decisões baseadas em dados com analytics detalhados e relatórios em tempo real.',
  },
];

export function useUpgradePlan() {
  const { data, isPendingPlans } = usePlansQuery();
  const { currentPlan } = useSubscriptionQuery();
  const { createSubscriptionMutation } = useSubscriptionMutations();

  const [type, setType] = useState<'month' | 'year'>('month');

  const filteredPlans = useMemo(() => {
    return data?.[type] || [];
  }, [data, type]);

  const currentPlanIndex = useMemo(() => {
    if (!currentPlan?.planId) return -1;
    return filteredPlans.findIndex(
      (plan) =>
        plan.id === currentPlan.planId &&
        plan.interval === currentPlan.billingPeriod,
    );
  }, [filteredPlans, currentPlan?.planId, currentPlan?.billingPeriod]);

  const isOnHighestPlan = useMemo(() => {
    if (!filteredPlans.length || currentPlanIndex < 0) return false;
    return currentPlanIndex === filteredPlans.length - 1;
  }, [filteredPlans.length, currentPlanIndex]);

  const isCancellationScheduled = Boolean(currentPlan?.cancelAtPeriodEnd);

  const handleSelectPlan = useCallback(
    (planId: string) => {
      if (isCancellationScheduled) return;
      createSubscriptionMutation.mutate(planId, {
        onSuccess: ({ url }) => {
          window.location.href = url;
        },
      });
    },
    [createSubscriptionMutation, isCancellationScheduled],
  );

  return {
    plans: filteredPlans,
    benefits,
    currentPlan,
    currentPlanIndex,
    isOnHighestPlan,
    isCancellationScheduled,
    isPendingPlans,
    isCreatingSubscription: createSubscriptionMutation.isPending,
    handleSelectPlan,
    type,
    setType,
  };
}
