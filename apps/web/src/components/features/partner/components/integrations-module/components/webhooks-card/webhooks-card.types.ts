export type TWebhooksCardConfig = {
  storeId: string;
};

/** Segredo de um webhook recém-criado, mostrado uma vez. */
export type TCreatedWebhookSecret = {
  url: string;
  secret: string;
};
