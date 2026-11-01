'use client';

import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { findLongestPathMatch } from '@/utils/constants/partner.constants';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PARTNER_NAV_HREFS, PARTNER_NAV_ITEMS } from './admin-sidebar.config';
import type {
  TNavItem,
  TPlanFeatureFlag,
  TPlanFeatures,
  TUseAdminSidebarConfig,
} from './admin-sidebar.types';

const hasPlanAccess = (
  requires: readonly TPlanFeatureFlag[] | undefined,
  features: TPlanFeatures | undefined,
) => !requires || requires.every((flag) => features?.[flag] === true);

const getVisibleNavItems = (features: TPlanFeatures | undefined): TNavItem[] =>
  PARTNER_NAV_ITEMS.flatMap<TNavItem>((item) => {
    if (!hasPlanAccess(item.requires, features)) return [];
    if (item.kind === 'link') return [item];

    const children = item.children.filter((child) =>
      hasPlanAccess(child.requires, features),
    );

    return children.length > 0 ? [{ ...item, children }] : [];
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

  const items = useMemo(() => getVisibleNavItems(features), [features]);

  const activeHref = findLongestPathMatch(pathname, PARTNER_NAV_HREFS);
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
