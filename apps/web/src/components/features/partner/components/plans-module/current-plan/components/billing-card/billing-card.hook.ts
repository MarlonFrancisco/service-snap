'use client';

import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { SubscriptionService } from '@/service/subscription/subscription.service';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { getBillingCharge, getLatestInvoice } from './billing-card.helpers';
import type { TBillingStatus } from './billing-card.types';

/**
 * A API não manda bandeira nem final do cartão: o cartão mostra só o que o
 * plano traz (próxima cobrança e a última fatura) e leva ao portal do Stripe.
 */
export const useBillingCard = () => {
  const { currentPlan } = useSubscriptionQuery();

  const billingPortalMutation = useMutation({
    mutationFn: () => SubscriptionService.createBillingPortal(),
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
    onError: () => {
      toast.error('Não foi possível abrir a página de pagamento', {
        description: 'Tente de novo em alguns instantes.',
      });
    },
  });

  const latestInvoice = useMemo(
    () => getLatestInvoice(currentPlan?.invoices),
    [currentPlan?.invoices],
  );

  const isPaymentFailed = latestInvoice?.status === 'failed';

  const status: TBillingStatus = isPaymentFailed
    ? { label: 'Pagamento recusado', tone: 'danger' }
    : { label: 'Em dia', tone: 'success' };

  const charge = getBillingCharge(
    currentPlan,
    isPaymentFailed ? latestInvoice : undefined,
  );

  const handleManagePayment = useCallback(() => {
    billingPortalMutation.mutate();
  }, [billingPortalMutation]);

  return {
    isVisible: !!currentPlan?.isActive,
    status,
    isPaymentFailed,
    charge,
    // Depois do sucesso a página já está indo para o Stripe
    isOpeningPortal:
      billingPortalMutation.isPending || billingPortalMutation.isSuccess,
    handleManagePayment,
  };
};
