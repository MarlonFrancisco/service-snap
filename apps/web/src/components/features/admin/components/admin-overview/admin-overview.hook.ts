'use client';

import { useAdminOverviewQuery } from '@/hooks/use-query/use-admin-query';
import { useMemo } from 'react';
import { buildAdminKpis } from '../../admin.helpers';

export const useAdminOverview = () => {
  const {
    overview,
    isLoadingOverview,
    isOverviewError,
    isFetchingOverview,
    refetchOverview,
  } = useAdminOverviewQuery();

  const kpis = useMemo(
    () => (overview ? buildAdminKpis(overview) : []),
    [overview],
  );

  return {
    kpis,
    isLoading: isLoadingOverview,
    isError: isOverviewError,
    isRetrying: isFetchingOverview,
    handleRetry: () => void refetchOverview(),
  };
};
