'use client';

import { useCampaignQuery } from '@/hooks/partner/use-campaigns-query';
import { useMemo } from 'react';
import {
  CHANNEL_LABEL,
  formatCustomersCount,
  toRecipientRow,
} from '../../../campaigns-module.helpers';
import { formatShortDate } from '../../../../packages-module/packages-module.helpers';
import type { TUseCampaignDetailDialogConfig } from './campaign-detail-dialog.types';

export const useCampaignDetailDialog = ({
  storeId,
  timeZone,
  campaignId,
}: TUseCampaignDetailDialogConfig) => {
  const { campaign, isLoadingCampaign, isCampaignError, refetchCampaign } =
    useCampaignQuery({ storeId, campaignId });

  const recipients = useMemo(
    () =>
      (campaign?.recipients ?? []).map((recipient) =>
        toRecipientRow(recipient, timeZone),
      ),
    [campaign, timeZone],
  );

  const summary = campaign
    ? [
        CHANNEL_LABEL[campaign.channel] ?? campaign.channel,
        formatShortDate(campaign.createdAt, timeZone),
        `sem visita há ${campaign.inactiveDays} dias`,
        formatCustomersCount(campaign.recipientsCount),
      ].join(' · ')
    : '';

  return {
    isOpen: !!campaignId,
    title: campaign?.name ?? 'Campanha',
    summary,
    templateName: campaign?.template?.name ?? null,
    message: campaign?.message ?? null,
    recipients,
    isLoading: isLoadingCampaign,
    isError: isCampaignError,
    handleRetry: () => void refetchCampaign(),
  };
};
