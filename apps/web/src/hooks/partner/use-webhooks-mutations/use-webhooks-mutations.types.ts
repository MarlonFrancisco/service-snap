import type { TUpdateWebhookEndpoint } from '@/types/api/webhooks.types';

export type TUseWebhooksMutationsConfig = {
  storeId: string;
};

export type TUpdateWebhookVariables = {
  id: string;
  changes: TUpdateWebhookEndpoint;
};

export type TRetryDeliveryVariables = {
  endpointId: string;
  deliveryId: string;
};
