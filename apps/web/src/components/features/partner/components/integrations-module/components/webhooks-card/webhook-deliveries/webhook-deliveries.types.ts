import type { IWebhookEndpoint } from '@/types/api/webhooks.types';

export type TWebhookDeliveriesConfig = {
  storeId: string;
  endpoints: IWebhookEndpoint[];
  endpointId: string;
  onEndpointChange: (endpointId: string) => void;
};
