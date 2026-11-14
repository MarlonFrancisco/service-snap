export type TUseWebhooksQueryConfig = {
  storeId?: string;
  enabled?: boolean;
};

export type TUseWebhookDeliveriesQueryConfig = TUseWebhooksQueryConfig & {
  endpointId?: string;
};
