import type { TCreatedApiKey } from '@/types/api/api-keys.types';

export type TNewApiKeyDialogConfig = {
  storeId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Recebe a chave inteira para mostrar uma vez. */
  onCreated: (apiKey: TCreatedApiKey) => void;
};
