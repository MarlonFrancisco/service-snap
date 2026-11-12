'use client';

import { cn, Spinner } from '@repo/ui';
import { AlertCircle, ExternalLink } from 'lucide-react';
import {
  MODULE_BADGE_CLASS,
  MODULE_BADGE_TONE_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
} from '../../../../notifications-module/notifications-module.styles';
import { useBillingCard } from './billing-card.hook';

export function BillingCard() {
  const {
    isVisible,
    status,
    isPaymentFailed,
    charge,
    isOpeningPortal,
    handleManagePayment,
  } = useBillingCard();

  if (!isVisible) return null;

  return (
    <section
      aria-label="Forma de pagamento e faturas"
      className="grid gap-3.5 rounded-[24px] border border-[#EBE9F0] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-lg font-extrabold">Forma de pagamento e faturas</h3>
        <span className={cn(MODULE_BADGE_CLASS, MODULE_BADGE_TONE_CLASS[status.tone])}>
          {status.label}
        </span>
      </div>

      {isPaymentFailed ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[14px] bg-[#FBE8E6] px-3.5 py-3 text-sm font-semibold text-[#A4231A]"
        >
          <AlertCircle aria-hidden="true" className="mt-px size-[18px] shrink-0" />
          Pagamento recusado. Atualize a forma de pagamento para manter o plano.
        </div>
      ) : null}

      {charge ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F0EEF4] pt-3 text-sm">
          <span className="text-[#5F5C6E]">{charge.label}</span>
          <b>{charge.value}</b>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleManagePayment}
        disabled={isOpeningPortal}
        className={cn(
          MODULE_PRIMARY_ACTION_CLASS,
          'min-h-12 w-full gap-2 text-sm font-bold disabled:cursor-wait disabled:opacity-70',
        )}
      >
        {isOpeningPortal ? (
          <>
            <Spinner />
            Abrindo...
          </>
        ) : (
          <>
            Gerenciar pagamento
            <ExternalLink aria-hidden="true" className="size-4 stroke-[1.8]" />
          </>
        )}
      </button>
      <p className="text-[13px] leading-normal text-[#5F5C6E]">
        Abre a página segura do Stripe para trocar o cartão, ver faturas e
        atualizar dados de cobrança.
      </p>
    </section>
  );
}
