'use client';

import { useCampaignsQuery } from '@/hooks/partner/use-campaigns-query';
import { useCallback, useMemo, useState } from 'react';
import { toCampaignRow } from '../../campaigns-module.helpers';
import type { TUseCampaignsHistoryConfig } from './campaigns-history.types';

export const useCampaignsHistory = ({
  storeId,
  timeZone,
}: TUseCampaignsHistoryConfig) => {
  const [openCampaignId, setOpenCampaignId] = useState<string | null>(null);
  const {
    campaigns,
    isLoadingCampaigns,
    isFetchingCampaigns,
    isCampaignsError,
    refetchCampaigns,
  } = useCampaignsQuery({ storeId });

  const rows = useMemo(
    () => campaigns.map((campaign) => toCampaignRow(campaign, timeZone)),
    [campaigns, timeZone],
  );

  const handleDetailOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setOpenCampaignId(null);
  }, []);

  return {
    rows,
    isLoading: isLoadingCampaigns,
    isError: isCampaignsError,
    isRetrying: isFetchingCampaigns,
    handleRetry: () => void refetchCampaigns(),
    openCampaignId,
    handleOpenCampaign: setOpenCampaignId,
    handleDetailOpenChange,
  };
};
