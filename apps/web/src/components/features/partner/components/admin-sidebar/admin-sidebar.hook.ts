'use client';

import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { findLongestPathMatch } from '@/utils/constants/partner.constants';
import { useAgendaMemberRole } from '@/hooks/partner/use-agenda-member-role';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PARTNER_NAV_HREFS,
  PARTNER_NAV_ITEMS,
  PROFESSIONAL_NAV_ITEMS,
} from './admin-sidebar.config';
import { hasPlanAccess } from '../plan-feature-gate';
import type {
  TNavItem,
  TPlanFeatures,
  TUseAdminSidebarConfig,
} from './admin-sidebar.types';

/**
 * Todos os módulos aparecem; os que o plano não libera vêm com `isLocked` e a
 * página mostra o aviso de upgrade (`PlanFeatureGate`).
 */
const getNavItemsWithAccess = (
  features: TPlanFeatures | undefined,
): TNavItem[] =>
  PARTNER_NAV_ITEMS.map<TNavItem>((item) => {
    const isLocked = !hasPlanAccess(item.requires, features);
    if (item.kind === 'link') return { ...item, isLocked };

    const children = item.children.map((child) => ({
      ...child,
      isLocked: isLocked || !hasPlanAccess(child.requires, features),
    }));

    return {
      ...item,
      children,
      isLocked: children.every((child) => child.isLocked),
    };
  });

// Usa a lista completa: em rota sem acesso pelo plano, o grupo segue ativo.
const getGroupIdByHref = (href: string | null) =>
  PARTNER_NAV_ITEMS.find(
    (item) =>
      item.kind === 'group' &&
      item.children.some((child) => child.href === href),
  )?.id ?? null;

export const useAdminSidebar = ({ onNavigate }: TUseAdminSidebarConfig) => {
  const pathname = usePathname();
  const { currentPlan } = useSubscriptionQuery();
  const features = currentPlan?.features;

  const searchParams = useSearchParams();
  const { isProfessional } = useAgendaMemberRole();

  const items = useMemo<TNavItem[]>(
    () =>
      isProfessional
        ? [...PROFESSIONAL_NAV_ITEMS]
        : getNavItemsWithAccess(features),
    [isProfessional, features],
  );

  // Os itens do profissional dividem a rota da agenda e mudam só o `painel`.
  const panel = searchParams.get('painel');
  const pathHref = findLongestPathMatch(pathname, PARTNER_NAV_HREFS);
  const activeHref =
    isProfessional && panel && pathHref === '/partner/agenda'
      ? `${pathHref}?painel=${panel}`
      : pathHref;
  const activeGroupId = getGroupIdByHref(activeHref);

  const [openGroupId, setOpenGroupId] = useState(activeGroupId);
  const [flyoutGroupId, setFlyoutGroupId] = useState<string | null>(null);

  useEffect(() => {
    setOpenGroupId(activeGroupId);
    setFlyoutGroupId(null);
  }, [pathname, activeGroupId]);

  const handleToggleGroup = useCallback((groupId: string) => {
    setOpenGroupId((current) => (current === groupId ? null : groupId));
  }, []);

  const handleFlyoutOpenChange = useCallback(
    (groupId: string, isOpen: boolean) => {
      setFlyoutGroupId(isOpen ? groupId : null);
    },
    [],
  );

  const handleNavigate = useCallback(() => {
    setFlyoutGroupId(null);
    onNavigate?.();
  }, [onNavigate]);

  return {
    items,
    activeHref,
    activeGroupId,
    openGroupId,
    flyoutGroupId,
    handleToggleGroup,
    handleFlyoutOpenChange,
    handleNavigate,
  };
};
