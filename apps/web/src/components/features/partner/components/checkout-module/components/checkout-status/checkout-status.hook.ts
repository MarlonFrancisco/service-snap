'use client';

import { useCheckoutMutations } from '@/hooks/partner/use-checkout-mutations';
import {
  useCheckoutPreviewQuery,
  useCheckoutQuery,
} from '@/hooks/partner/use-checkout-query';
import { useCashCurrentQuery } from '@/hooks/partner/use-cash-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  formatClock,
  getMemberName,
  PAYMENT_METHOD_LABEL,
} from '../../../cash-module/cash-module.helpers';
import { useManagementAccess } from '../../../cash-module/cash-module.hook';
import {
  CHECKOUT_STATUSES,
  getUndoCheckoutError,
} from '../../checkout-module.helpers';
import type { TUseCheckoutStatusConfig } from './checkout-status.types';

const formatSessions = (count: number) =>
  count === 1
    ? '1 sessão do pacote usada'
    : `${count} sessões do pacote usadas`;

/**
 * Se a visita já foi fechada (resumo e "Desfazer") ou se ainda dá para fechar.
 * Desfazer é de dono e gerente e só enquanto o caixa daquele fechamento está
 * aberto: depois disso a API recusa.
 */
export const useCheckoutStatus = ({
  appointment,
  items,
}: TUseCheckoutStatusConfig) => {
  const { storeId, canManage, memberNames, formatMoney } =
    useManagementAccess();
  const [isConfirmingUndo, setIsConfirmingUndo] = useState(false);
  const undoTriggerRef = useRef<HTMLButtonElement>(null);
  const isEligible = CHECKOUT_STATUSES.includes(appointment.status);

  const scheduleIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    setIsConfirmingUndo(false);
  }, [appointment.id]);

  const { preview, isLoadingPreview, isPreviewError, refetchPreview } =
    useCheckoutPreviewQuery({ storeId, scheduleIds, enabled: isEligible });

  const checkoutId =
    preview?.items.find((item) => item.checkoutId)?.checkoutId ?? null;

  const { checkout, isLoadingCheckout } = useCheckoutQuery({
    storeId,
    checkoutId,
  });

  const { currentSession } = useCashCurrentQuery({
    storeId,
    enabled: !!checkoutId && canManage,
  });

  const summary = useMemo(() => {
    if (!checkout) return null;

    const methods = [
      ...new Set(
        checkout.payments
          .filter((payment) => !payment.voidedAt)
          .map((payment) => PAYMENT_METHOD_LABEL[payment.method]),
      ),
    ];
    const packageSessions = checkout.items.filter(
      (item) => item.fromPackage,
    ).length;
    const received =
      checkout.received > 0
        ? `Recebido ${formatMoney(checkout.received)}${methods.length ? ` em ${methods.join(' e ')}` : ''}`
        : 'Nada recebido';

    return {
      title: `Fechado por ${checkout.closedByName || getMemberName(memberNames, checkout.closedById)} às ${formatClock(checkout.closedAt)}`,
      description: [
        received,
        packageSessions ? formatSessions(packageSessions) : null,
        checkout.loyaltyReward
          ? `Recompensa: ${checkout.loyaltyReward.description}`
          : null,
      ]
        .filter(Boolean)
        .join(' · '),
    };
  }, [checkout, memberNames, formatMoney]);

  // Sem pagamento não há caixa para conferir; com pagamento, o caixa aberto
  // precisa ser o mesmo do fechamento (aberto antes dele)
  const isCashOpenForCheckout =
    !!checkout &&
    (checkout.received === 0 ||
      (!!currentSession &&
        new Date(checkout.closedAt).getTime() >=
          new Date(currentSession.openedAt).getTime()));

  const { undoCheckoutMutation } = useCheckoutMutations({ storeId });

  const handleRequestUndo = useCallback(() => setIsConfirmingUndo(true), []);

  const handleDismissUndo = useCallback(() => {
    setIsConfirmingUndo(false);
    requestAnimationFrame(() => undoTriggerRef.current?.focus());
  }, []);

  const handleUndo = useCallback(() => {
    if (!checkout) return;

    undoCheckoutMutation.mutate(
      { id: checkout.id, customerId: checkout.customer?.id },
      {
        onSuccess: () => {
          toast.success('Fechamento desfeito');
          setIsConfirmingUndo(false);
        },
        onError: (error) => toast.error(getUndoCheckoutError(error)),
      },
    );
  }, [checkout, undoCheckoutMutation]);

  return {
    isEligible,
    isLoading: isEligible && (isLoadingPreview || isLoadingCheckout),
    isError: isPreviewError,
    handleRetry: () => void refetchPreview(),
    isClosed: !!checkoutId,
    summary,
    canUndo: canManage && isCashOpenForCheckout,
    showUndoLocked: canManage && !!checkout && !isCashOpenForCheckout,
    isConfirmingUndo,
    undoTriggerRef,
    isUndoing: undoCheckoutMutation.isPending,
    handleRequestUndo,
    handleDismissUndo,
    handleUndo,
  };
};
