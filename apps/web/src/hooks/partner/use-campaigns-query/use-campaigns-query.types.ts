export type TUseCampaignsQueryConfig = {
  storeId: string | undefined;
  enabled?: boolean;
};

export type TUseCampaignQueryConfig = TUseCampaignsQueryConfig & {
  campaignId: string | null | undefined;
};

export type TUseInactiveCustomersQueryConfig = TUseCampaignsQueryConfig & {
  inactiveDays: number;
};
