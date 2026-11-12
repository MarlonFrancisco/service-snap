import {
  MEMBER_ROLE_LABEL,
  useAgendaMemberRole,
} from '@/hooks/partner/use-agenda-member-role';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { usePartnerStore } from '@/store/partner';
import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/providers/analytics.provider';
import { useCallback, useEffect, useMemo, useRef } from 'react';

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
  const analytics = useAnalytics();
  const hasTrackedWarningRef = useRef(false);
  const { role, isProfessional } = useAgendaMemberRole();
  const storeName = usePartnerStore((state) => state.activeStore.name);

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

  const isWarningVisible = !isHidden && (isAtLimit || isNearLimit);

  // Uma vez por sessão do painel: a sidebar fica montada entre as páginas.
  useEffect(() => {
    if (!isWarningVisible || hasTrackedWarningRef.current) return;
    hasTrackedWarningRef.current = true;

    analytics.track('plan_limit_warning_viewed', {
      is_at_limit: isAtLimit,
      is_near_limit: isNearLimit,
    });
  }, [isWarningVisible, isAtLimit, isNearLimit, analytics]);

  // Só o "Fazer upgrade" conta como CTA; "Ver plano" é navegação.
  const handlePlanActionClick = useCallback(() => {
    if (!isAtLimit && !isNearLimit) return;
    analytics.track('plan_upgrade_cta_clicked', { source: 'sidebar' });
  }, [isAtLimit, isNearLimit, analytics]);

  return {
    // O profissional não vê o plano: vê a loja e o papel dele nela.
    memberCard: isProfessional
      ? { storeName, roleLabel: MEMBER_ROLE_LABEL[role] }
      : null,
    currentPlan,
    isHidden,
    handlePlanActionClick,
    usageRows,
    isNearLimit,
    isAtLimit,
    planAction,
  };
};
