'use client';

import { useCashMutations } from '@/hooks/partner/use-cash-mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getErrorStatus, parseMoneyInput } from '../../../cash-module.helpers';
import {
  REGISTER_PAYMENT_EMPTY_VALUES,
  registerPaymentSchema,
  type TRegisterPaymentSchema,
} from './register-payment-dialog.schema';
import type { TUseRegisterPaymentDialogConfig } from './register-payment-dialog.types';

const getRegisterPaymentError = (error: unknown) =>
  getErrorStatus(error) === 400
    ? 'Confira a forma de pagamento e o valor.'
    : 'Não foi possível registrar o pagamento. Tente de novo.';

export const useRegisterPaymentDialog = ({
  storeId,
  isOpen,
  onOpenChange,
}: TUseRegisterPaymentDialogConfig) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { registerPaymentMutation } = useCashMutations({ storeId });

  const form = useForm<TRegisterPaymentSchema>({
    resolver: zodResolver(registerPaymentSchema),
    defaultValues: REGISTER_PAYMENT_EMPTY_VALUES,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(REGISTER_PAYMENT_EMPTY_VALUES);
      setSubmitError(null);
    }
  }, [isOpen, form]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && registerPaymentMutation.isPending) return;
      onOpenChange(nextOpen);
    },
    [onOpenChange, registerPaymentMutation.isPending],
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit((data) => {
      registerPaymentMutation.mutate(
        {
          method: data.method,
          amount: parseMoneyInput(data.amount) ?? 0,
          ...(data.notes && { notes: data.notes }),
        },
        {
          onSuccess: () => {
            toast.success('Pagamento registrado');
            onOpenChange(false);
          },
          onError: (error) => setSubmitError(getRegisterPaymentError(error)),
        },
      );
    })(event);
  };

  return {
    form,
    errors: form.formState.errors,
    submitError,
    isSubmitting: registerPaymentMutation.isPending,
    handleOpenChange,
    handleSubmit,
  };
};
