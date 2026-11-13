'use client';

import { useCashMutations } from '@/hooks/partner/use-cash-mutations';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  formatClock,
  getErrorMessage,
  getErrorStatus,
  getPersonName,
  PAYMENT_METHOD_LABEL,
} from '../../../cash-module.helpers';
import type { TVoidPaymentDialogConfig } from './void-payment-dialog.types';

export const MAX_VOID_REASON_LENGTH = 300;

const getVoidError = (error: unknown) => {
  const status = getErrorStatus(error);

  if (status === 409 && /already voided/i.test(getErrorMessage(error))) {
    return 'Este pagamento já foi estornado.';
  }
  if (status === 409) {
    return 'O caixa deste pagamento já foi fechado: não dá mais para estornar.';
  }
  if (status === 403) return 'Só o dono e o gerente estornam pagamentos.';

  return 'Não foi possível estornar o pagamento. Tente de novo.';
};

export const useVoidPaymentDialog = ({
  storeId,
  payment,
  onClose,
  formatMoney,
}: TVoidPaymentDialogConfig) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { voidPaymentMutation } = useCashMutations({ storeId });

  useEffect(() => {
    setReason('');
    setError(null);
  }, [payment?.id]);

  const description = useMemo(() => {
    if (!payment) return '';

    return [
      `${formatMoney(payment.amount)} em ${PAYMENT_METHOD_LABEL[payment.method]}`,
      getPersonName(payment.customer),
      formatClock(payment.paidAt),
    ]
      .filter(Boolean)
      .join(' · ');
  }, [payment, formatMoney]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && !voidPaymentMutation.isPending) onClose();
    },
    [onClose, voidPaymentMutation.isPending],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = reason.trim();

    if (!payment) return;
    if (!trimmed) {
      setError('Conte o motivo do estorno.');
      return;
    }

    setError(null);
    voidPaymentMutation.mutate(
      { id: payment.id, reason: trimmed },
      {
        onSuccess: () => {
          toast.success('Pagamento estornado');
          onClose();
        },
        onError: (mutationError) => setError(getVoidError(mutationError)),
      },
    );
  };

  return {
    isOpen: !!payment,
    description,
    reason,
    setReason,
    error,
    isSubmitting: voidPaymentMutation.isPending,
    handleOpenChange,
    handleSubmit,
  };
};
