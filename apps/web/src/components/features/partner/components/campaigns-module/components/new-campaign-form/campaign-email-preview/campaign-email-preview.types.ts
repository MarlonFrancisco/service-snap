export type TCampaignEmailPreviewConfig = {
  storeName: string;
  customerName: string;
  /** Texto da loja, com as quebras de linha. */
  message: string;
  /** `dd/mm/aaaa` */
  lastVisit: string;
  year: number;
};
