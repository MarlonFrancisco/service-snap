import type { IWebhookEndpoint } from '@/types/api/webhooks.types';

export type TWebhookEndpointItemConfig = {
  storeId: string;
  endpoint: IWebhookEndpoint;
  onEdit: (endpoint: IWebhookEndpoint) => void;
  /** Mostra as entregas deste endpoint na lista abaixo. */
  onShowDeliveries: (endpointId: string) => void;
  isShowingDeliveries: boolean;
};

export type TWebhookConfirmAction = 'rotate' | 'remove' | null;
