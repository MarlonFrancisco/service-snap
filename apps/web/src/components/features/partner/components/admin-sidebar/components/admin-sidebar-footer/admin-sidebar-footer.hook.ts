import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const PLAN_ROUTE = '/partner/plans';

const getUsage = (current: number, limit: number) => {
  const isUnlimited = limit === 0;

  return {
    current,
    limit,
    percentage: isUnlimited ? 0 : Math.round((current / limit) * 100),
    isUnlimited,
  };
};

export const useAdminSidebarFooter = () => {
  const { currentPlan } = useSubscriptionQuery();
  const pathname = usePathname();

  const isHidden =
    pathname === PLAN_ROUTE || pathname.startsWith(`${PLAN_ROUTE}/`);

  const storesUsage = useMemo(
    () =>
      currentPlan
        ? getUsage(currentPlan.storesLength, currentPlan.features.UNIT_LIMIT)
        : null,
    [currentPlan],
  );

  const professionalsUsage = useMemo(
    () =>
      currentPlan
        ? getUsage(
            currentPlan.storeMembersLength,
            currentPlan.features.PRO_LIMIT,
          )
        : null,
    [currentPlan],
  );

  const usageRows = useMemo(
    () =>
      storesUsage && professionalsUsage
        ? [
            { id: 'stores', label: 'Lojas', usage: storesUsage },
            {
              id: 'professionals',
              label: 'Profissionais',
              usage: professionalsUsage,
            },
          ]
        : [],
    [storesUsage, professionalsUsage],
  );

  const isNearLimit = usageRows.some(
    ({ usage }) =>
      !usage.isUnlimited && usage.percentage >= 80 && usage.percentage < 100,
  );

  const isAtLimit = usageRows.some(
    ({ usage }) => !usage.isUnlimited && usage.percentage >= 100,
  );

  // Com alerta na tela, a ação precisa levar à saída que ele pede.
  const planAction =
    isAtLimit || isNearLimit
      ? { href: `${PLAN_ROUTE}/upgrade`, label: 'Fazer upgrade' }
      : { href: `${PLAN_ROUTE}/me`, label: 'Ver plano' };

  return {
    currentPlan,
    isHidden,
    usageRows,
    isNearLimit,
    isAtLimit,
    planAction,
  };
};
