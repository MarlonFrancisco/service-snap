'use client';

import { useCashMutations } from '@/hooks/partner/use-cash-mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import {
  formatSignedMoney,
  getErrorStatus,
  parseMoneyInput,
  sumMoney,
} from '../../../cash-module.helpers';
import {
  CLOSE_CASH_EMPTY_VALUES,
  closeCashSchema,
  type TCloseCashSchema,
} from './close-cash-dialog.schema';
import type {
  TCashDifference,
  TCloseCashDialogConfig,
} from './close-cash-dialog.types';

const getCloseCashError = (error: unknown) => {
  const status = getErrorStatus(error);

  if (status === 409) return 'Este caixa já foi fechado.';
  if (status === 403) return 'Só o dono e o gerente fecham o caixa.';

  return 'Não foi possível fechar o caixa. Tente de novo.';
};

export const useCloseCashDialog = ({
  storeId,
  session,
  isOpen,
  onOpenChange,
  formatMoney,
}: TCloseCashDialogConfig) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { closeSessionMutation } = useCashMutations({ storeId });

  const form = useForm<TCloseCashSchema>({
    resolver: zodResolver(closeCashSchema),
    defaultValues: CLOSE_CASH_EMPTY_VALUES,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(CLOSE_CASH_EMPTY_VALUES);
      setSubmitError(null);
    }
  }, [isOpen, form]);

  const countedInput = useWatch({ control: form.control, name: 'countedCash' });
  const { totals, expectedCash } = session.summary;

  const difference = useMemo((): TCashDifference | null => {
    const counted = countedInput.trim() ? parseMoneyInput(countedInput) : null;

    if (counted === null) return null;

    const value = sumMoney([counted, -expectedCash]);

    if (value === 0) {
      return {
        tone: 'success',
        title: 'Sem diferença',
        description: 'O dinheiro contado bate com o esperado na gaveta.',
      };
    }

    return {
      tone: value < 0 ? 'warning' : 'info',
      title: `Diferença: ${formatSignedMoney(value, formatMoney)}`,
      description:
        'Fica gravada no fechamento. Explique abaixo, se souber o motivo.',
    };
  }, [countedInput, expectedCash, formatMoney]);

  const summary = useMemo(
    () => ({
      openingAmount: formatMoney(session.openingAmount),
      cashReceived: formatMoney(totals.cash),
      expectedCash: formatMoney(expectedCash),
      pix: formatMoney(totals.pix),
      cards: formatMoney(sumMoney([totals.credit_card, totals.debit_card])),
      other: formatMoney(totals.other),
    }),
    [session.openingAmount, totals, expectedCash, formatMoney],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && closeSessionMutation.isPending) return;
      onOpenChange(nextOpen);
    },
    [onOpenChange, closeSessionMutation.isPending],
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit((data) => {
      closeSessionMutation.mutate(
        {
          id: session.id,
          closing: {
            countedCash: parseMoneyInput(data.countedCash) ?? 0,
            ...(data.notes && { notes: data.notes }),
          },
        },
        {
          onSuccess: () => {
            toast.success('Caixa fechado');
            onOpenChange(false);
          },
          onError: (error) => setSubmitError(getCloseCashError(error)),
        },
      );
    })(event);
  };

  return {
    form,
    errors: form.formState.errors,
    summary,
    difference,
    submitError,
    isSubmitting: closeSessionMutation.isPending,
    handleOpenChange,
    handleSubmit,
  };
};
