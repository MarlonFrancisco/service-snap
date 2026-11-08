'use client';

import { cn } from '@repo/ui';
import {
  MODULE_ACTION_CLASS,
  MODULE_BADGE_CLASS,
} from '../../../../notifications-module/notifications-module.styles';
import { usePaymentHistoryCard } from './payment-history-card.hook';

export function PaymentHistoryCard() {
  const { paymentHistory, downloadPDF } = usePaymentHistoryCard();

  return (
    <section className="grid gap-3.5 rounded-[24px] border border-[#EBE9F0] p-6">
      <h3 className="text-lg font-extrabold">Histórico de pagamentos</h3>

      {paymentHistory.length === 0 ? (
        <p className="text-sm leading-normal text-[#5F5C6E]">
          Nenhuma fatura disponível ainda. Cobranças confirmadas aparecem aqui.
        </p>
      ) : (
        <ul>
          {paymentHistory.map((payment) => (
            <li
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#F0EEF4] py-2.5 text-sm"
            >
              <div className="min-w-0 break-words">
                {payment.invoiceLabel}
                <span className="block text-[13px] text-[#5F5C6E]">
                  {payment.dateLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <strong>{payment.amountLabel}</strong>
                <span
                  className={cn(MODULE_BADGE_CLASS, payment.statusClassName)}
                >
                  {payment.statusLabel}
                </span>
                {payment.pdfUrl ? (
                  <button
                    type="button"
                    onClick={() =>
                      downloadPDF(payment.pdfUrl, payment.fileName)
                    }
                    aria-label={`Baixar PDF da fatura ${payment.invoiceLabel}`}
                    className={MODULE_ACTION_CLASS}
                  >
                    Baixar PDF
                  </button>
                ) : (
                  <span className="text-[13px] text-[#5F5C6E]">
                    PDF indisponível
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
