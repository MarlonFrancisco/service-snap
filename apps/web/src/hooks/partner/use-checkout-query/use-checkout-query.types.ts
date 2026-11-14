export type TUseCheckoutPreviewQueryConfig = {
  storeId?: string;
  /** Atendimentos da mesma visita. */
  scheduleIds: string[];
  enabled?: boolean;
};

export type TUseCheckoutQueryConfig = {
  storeId?: string;
  checkoutId?: string | null;
  enabled?: boolean;
};
