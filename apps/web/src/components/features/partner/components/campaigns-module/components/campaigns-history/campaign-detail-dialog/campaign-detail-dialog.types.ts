export type TCampaignDetailDialogConfig = {
  storeId: string;
  timeZone?: string;
  /** `null` fecha o diálogo. */
  campaignId: string | null;
  onOpenChange: (isOpen: boolean) => void;
};

export type TUseCampaignDetailDialogConfig = TCampaignDetailDialogConfig;
