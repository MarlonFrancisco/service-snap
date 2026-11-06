'use client';

import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useCallback, useMemo } from 'react';
import {
  MODULE_BADGE_TONE_CLASS,
  type TModuleBadgeTone,
} from '../../../../notifications-module/notifications-module.styles';
import { formatPlanPrice } from '../../../plans-module.utils';
import type {
  TInvoiceStatus,
  TPaymentHistoryRow,
} from './payment-history-card.types';

const INVOICE_STATUS: Record<
  TInvoiceStatus,
  { label: string; tone: TModuleBadgeTone }
> = {
  paid: { label: 'Pago', tone: 'success' },
  pending: { label: 'Pendente', tone: 'warning' },
  failed: { label: 'Falhou', tone: 'danger' },
  uncollectible: { label: 'Não coletável', tone: 'neutral' },
  open: { label: 'Aberto', tone: 'warning' },
  draft: { label: 'Rascunho', tone: 'neutral' },
};

const formatInvoiceDate = (date: Date) =>
  new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

export const usePaymentHistoryCard = () => {
  const { currentPlan } = useSubscriptionQuery();
  const currency = currentPlan?.currency;
  const invoices = currentPlan?.invoices;
  const analytics = useAnalytics();

  const paymentHistory = useMemo<TPaymentHistoryRow[]>(
    () =>
      (invoices ?? [])
        // Draft Stripe invoices are noisy in partner UX — keep paid/open/failed/etc.
        .filter((invoice) => invoice.status !== 'draft')
        .map((invoice) => {
          const status = INVOICE_STATUS[invoice.status];

          return {
            id: invoice.id,
            invoiceLabel: invoice.invoiceNumber || 'Fatura sem número',
            dateLabel: formatInvoiceDate(invoice.date),
            amountLabel: formatPlanPrice(Number(invoice.amount) || 0, currency),
            statusLabel: status?.label ?? invoice.status,
            statusClassName: MODULE_BADGE_TONE_CLASS[status?.tone ?? 'neutral'],
            pdfUrl: invoice.pdfUrl,
            fileName: invoice.invoiceNumber || invoice.id,
          };
        }),
    [invoices, currency],
  );

  const downloadPDF = useCallback(
    (pdfUrl: string, invoiceNumber: string) => {
      if (!pdfUrl) return;

      const invoice = invoices?.find((item) => item.pdfUrl === pdfUrl);
      analytics.track('invoice_downloaded', { status: invoice?.status });

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `fatura-${invoiceNumber}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [invoices, analytics],
  );

  return { paymentHistory, downloadPDF };
};
