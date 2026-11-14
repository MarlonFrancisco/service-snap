'use client';

import { useCashMutations } from '@/hooks/partner/use-cash-mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getErrorStatus, parseMoneyInput } from '../../../cash-module.helpers';
import {
  OPEN_CASH_EMPTY_VALUES,
  openCashSchema,
  type TOpenCashSchema,
} from './open-cash-dialog.schema';
import type { TUseOpenCashDialogConfig } from './open-cash-dialog.types';

const getOpenCashError = (error: unknown) => {
  const status = getErrorStatus(error);

  if (status === 409) return 'Já existe um caixa aberto nesta loja.';
  if (status === 403) return 'Só o dono e o gerente abrem o caixa.';

  return 'Não foi possível abrir o caixa. Tente de novo.';
};

export const useOpenCashDialog = ({
  storeId,
  isOpen,
  onOpenChange,
}: TUseOpenCashDialogConfig) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { openSessionMutation } = useCashMutations({ storeId });

  const form = useForm<TOpenCashSchema>({
    resolver: zodResolver(openCashSchema),
    defaultValues: OPEN_CASH_EMPTY_VALUES,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(OPEN_CASH_EMPTY_VALUES);
      setSubmitError(null);
    }
  }, [isOpen, form]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && openSessionMutation.isPending) return;
      onOpenChange(nextOpen);
    },
    [onOpenChange, openSessionMutation.isPending],
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit((data) => {
      openSessionMutation.mutate(
        { openingAmount: parseMoneyInput(data.openingAmount) ?? 0 },
        {
          onSuccess: () => {
            toast.success('Caixa aberto');
            onOpenChange(false);
          },
          onError: (error) => setSubmitError(getOpenCashError(error)),
        },
      );
    })(event);
  };

  return {
    form,
    errors: form.formState.errors,
    submitError,
    isSubmitting: openSessionMutation.isPending,
    handleOpenChange,
    handleSubmit,
  };
};
