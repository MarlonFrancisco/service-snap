import type {
  IWebhookEndpoint,
  TCreatedWebhookEndpoint,
} from '@/types/api/webhooks.types';

export type TWebhookDialogConfig = {
  storeId: string;
  isOpen: boolean;
  /** Com endpoint, edita; sem, cria. */
  endpoint: IWebhookEndpoint | null;
  onOpenChange: (isOpen: boolean) => void;
  /** Recebe o segredo inteiro para mostrar uma vez. */
  onCreated: (endpoint: TCreatedWebhookEndpoint) => void;
};
