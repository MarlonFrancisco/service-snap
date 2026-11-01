export type TInvoiceStatus =
  | 'paid'
  | 'pending'
  | 'failed'
  | 'uncollectible'
  | 'open'
  | 'draft';

export type TPaymentHistoryRow = {
  id: string;
  invoiceLabel: string;
  dateLabel: string;
  amountLabel: string;
  statusLabel: string;
  statusClassName: string;
  pdfUrl: string;
  fileName: string;
};
