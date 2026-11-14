'use client';

import { useCheckoutMutations } from '@/hooks/partner/use-checkout-mutations';
import { useCheckoutPreviewQuery } from '@/hooks/partner/use-checkout-query';
import { PAYMENT_METHODS } from '@/types/api/cash.types';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import {
  getPersonName,
  parseMoneyInput,
  sumMoney,
  toMoneyInput,
} from '../../../cash-module/cash-module.helpers';
import { useManagementAccess } from '../../../cash-module/cash-module.hook';
import {
  buildCheckoutLines,
  calculateCheckoutTotals,
  describeReward,
  formatVisitLine,
  getCreateCheckoutError,
  getRewardDiscount,
  MAX_CHECKOUT_PAYMENTS,
} from '../../checkout-module.helpers';
import type { TCheckoutRewardView } from '../../checkout-module.types';
import {
  CHECKOUT_EMPTY_VALUES,
  checkoutSchema,
  type TCheckoutSchema,
} from './checkout-form.schema';
import type { TCheckoutFormConfig } from './checkout-form.types';

/**
 * Fechamento da visita. A conta da tela repete a da API (pacote fora do
 * subtotal, desconto até o subtotal) para o valor a receber já vir preenchido.
 * Enquanto ninguém mexe no valor da forma de pagamento, ele acompanha o total.
 */
export const useCheckoutForm = ({
  appointment,
  items,
  onDone,
}: Omit<TCheckoutFormConfig, 'onCancel'>) => {
  const { storeId, formatMoney } = useManagementAccess();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isAmountEdited = useRef(false);
  const scheduleIds = useMemo(() => items.map((item) => item.id), [items]);

  const { preview, isLoadingPreview, isPreviewError, refetchPreview } =
    useCheckoutPreviewQuery({ storeId, scheduleIds });
  const { createCheckoutMutation } = useCheckoutMutations({ storeId });

  const form = useForm<TCheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: CHECKOUT_EMPTY_VALUES,
  });
  const payments = useFieldArray({ control: form.control, name: 'payments' });

  const [usePackages, rewardId, discountInput, paymentValues] = useWatch({
    control: form.control,
    name: ['usePackages', 'rewardId', 'discount', 'payments'],
  });

  const lines = useMemo(
    () => buildCheckoutLines(preview?.items ?? [], usePackages),
    [preview, usePackages],
  );
  const charged = useMemo(
    () => lines.filter((line) => !line.fromPackage),
    [lines],
  );
  const hasPackage = (preview?.items ?? []).some((item) => !!item.package);

  const rewards = useMemo(
    (): TCheckoutRewardView[] =>
      (preview?.rewards ?? []).map((reward) => ({
        ...reward,
        discount: getRewardDiscount(reward, charged),
        details: describeReward(reward),
      })),
    [preview, charged],
  );

  const selectedReward = rewards.find((reward) => reward.id === rewardId);

  // Recompensa que deixou de valer (ex.: o serviço passou a sair do pacote)
  useEffect(() => {
    if (selectedReward && selectedReward.discount === null) {
      form.setValue('rewardId', '');
    }
  }, [selectedReward, form]);

  const totals = useMemo(
    () =>
      calculateCheckoutTotals(
        lines,
        selectedReward?.discount ?? 0,
        parseMoneyInput(discountInput) ?? 0,
      ),
    [lines, selectedReward, discountInput],
  );

  useEffect(() => {
    if (isAmountEdited.current || payments.fields.length !== 1) return;

    form.setValue('payments.0.amount', toMoneyInput(totals.total));
  }, [totals.total, payments.fields.length, form]);

  const received = sumMoney(
    paymentValues.map((payment) => parseMoneyInput(payment.amount) ?? 0),
  );

  const handleAmountEdited = useCallback(() => {
    isAmountEdited.current = true;
  }, []);

  const handleAddPayment = useCallback(() => {
    const used = new Set(paymentValues.map((payment) => payment.method));
    const method =
      PAYMENT_METHODS.find((candidate) => !used.has(candidate)) ?? 'other';
    const remaining = Math.max(totals.total - received, 0);

    isAmountEdited.current = true;
    payments.append({ method, amount: toMoneyInput(remaining) });
  }, [paymentValues, totals.total, received, payments]);

  const handleRemovePayment = useCallback(
    (index: number) => payments.remove(index),
    [payments],
  );

  const handleToggleReward = useCallback(
    (id: string, checked: boolean) =>
      form.setValue('rewardId', checked ? id : ''),
    [form],
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit((data) => {
      const manualDiscount = parseMoneyInput(data.discount) ?? 0;

      createCheckoutMutation.mutate(
        {
          scheduleIds,
          payments: data.payments
            .map((payment) => ({
              method: payment.method,
              amount: parseMoneyInput(payment.amount) ?? 0,
            }))
            .filter((payment) => payment.amount > 0),
          ...(hasPackage && { usePackages: data.usePackages }),
          ...(data.rewardId && { rewardId: data.rewardId }),
          ...(manualDiscount > 0 && { discount: manualDiscount }),
        },
        {
          onSuccess: () => {
            toast.success('Atendimento fechado');
            onDone();
          },
          onError: (error) => setSubmitError(getCreateCheckoutError(error)),
        },
      );
    })(event);
  };

  const customerName =
    preview?.customer?.name ||
    getPersonName(appointment.user) ||
    'Cliente sem nome';

  return {
    form,
    errors: form.formState.errors,
    customerName,
    visitLine: formatVisitLine({
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      professionalName: getPersonName(appointment.storeMember?.user),
    }),
    lines,
    hasPackage,
    rewards,
    selectedRewardId: rewardId,
    paymentFields: payments.fields,
    canAddPayment: payments.fields.length < MAX_CHECKOUT_PAYMENTS,
    summary: {
      subtotal: formatMoney(totals.subtotal),
      discount: `– ${formatMoney(totals.discount)}`,
      total: formatMoney(totals.total),
    },
    formatMoney,
    isLoading: isLoadingPreview,
    isError: isPreviewError,
    handleRetry: () => void refetchPreview(),
    submitError,
    isSubmitting: createCheckoutMutation.isPending,
    handleAmountEdited,
    handleAddPayment,
    handleRemovePayment,
    handleToggleReward,
    handleSubmit,
  };
};
