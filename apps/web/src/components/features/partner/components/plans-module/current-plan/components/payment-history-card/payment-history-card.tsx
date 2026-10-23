'use client';

import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { formatPriceByCurrency } from '@repo/shared/formatters';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Calendar, Download, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { usePaymentHistoryCard } from './payment-history-card.hook';

interface PaymentHistoryCardProps {
  delay?: number;
}

export function PaymentHistoryCard({ delay = 0.2 }: PaymentHistoryCardProps) {
  const { currentPlan } = useSubscriptionQuery();
  const { downloadPDF, getStatusBadge, formatDate } = usePaymentHistoryCard();

  const paymentHistory = useMemo(() => {
    const invoices = currentPlan?.invoices || [];
    // Draft Stripe invoices are noisy in partner UX — keep paid/open/failed/etc.
    return invoices.filter((invoice) => invoice.status !== 'draft');
  }, [currentPlan?.invoices]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentHistory.length === 0 ? (
            <p className="text-sm text-gray-600 py-6 text-center">
              Nenhuma fatura disponível ainda. Cobranças confirmadas da Stripe
              aparecem aqui.
            </p>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment) => {
                const statusConfig = getStatusBadge(payment.status) || {
                  label: payment.status,
                  className: 'bg-gray-50 text-gray-700 border-gray-200',
                };
                const amountLabel = formatPriceByCurrency(
                  Number(payment.amount) || 0,
                  currentPlan?.currency || 'BRL',
                );

                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">
                          {payment.invoiceNumber || 'Fatura sem número'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(payment.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900">{amountLabel}</span>
                      <Badge
                        variant="outline"
                        className={statusConfig.className}
                      >
                        {statusConfig.label}
                      </Badge>
                      {payment.pdfUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            downloadPDF(
                              payment.pdfUrl,
                              payment.invoiceNumber || payment.id,
                            )
                          }
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Baixar PDF da fatura"
                        >
                          <Download className="h-4 w-4 text-gray-600 hover:text-gray-900" />
                        </button>
                      ) : (
                        <span
                          className="p-2 text-gray-300"
                          title="PDF indisponível"
                        >
                          <Download className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
