'use client';

import { useCommissionsMutations } from '@/hooks/partner/use-commissions-mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import {
  getErrorStatus,
  getPersonName,
  parseMoneyInput,
  toDateKey,
} from '../../../../cash-module/cash-module.helpers';
import { useManagementAccess } from '../../../../cash-module/cash-module.hook';
import {
  ALL_OPTION,
  commissionRuleSchema,
  type TCommissionRuleSchema,
} from './commission-rule-form.schema';
import type {
  TCommissionRuleFormConfig,
  TCommissionRuleOption,
} from './commission-rule-form.types';

const getEmptyValues = (): TCommissionRuleSchema => ({
  storeMemberId: ALL_OPTION,
  serviceId: ALL_OPTION,
  type: 'percent',
  value: '',
  effectiveFrom: toDateKey(new Date()),
});

const getRuleError = (error: unknown) =>
  getErrorStatus(error) === 400
    ? 'Confira o profissional, o serviço e o valor da regra.'
    : 'Não foi possível salvar a regra. Tente de novo.';

const byName = (a: TCommissionRuleOption, b: TCommissionRuleOption) =>
  a.name.localeCompare(b.name, 'pt-BR');

export const useCommissionRuleForm = ({
  storeId,
}: TCommissionRuleFormConfig) => {
  const { storeMembers, storeServices, formatMoney } = useManagementAccess();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createRuleMutation } = useCommissionsMutations({ storeId });

  const form = useForm<TCommissionRuleSchema>({
    resolver: zodResolver(commissionRuleSchema),
    defaultValues: getEmptyValues(),
  });

  const type = useWatch({ control: form.control, name: 'type' });

  const memberOptions = useMemo(
    (): TCommissionRuleOption[] =>
      storeMembers
        .filter((member) => member.isActive !== false)
        .map((member) => ({
          id: member.id,
          name: getPersonName(member.user) || 'Profissional',
        }))
        .sort(byName),
    [storeMembers],
  );

  const serviceOptions = useMemo(
    (): TCommissionRuleOption[] =>
      storeServices
        .filter((service) => service.isActive !== false)
        .map((service) => ({ id: service.id, name: service.name }))
        .sort(byName),
    [storeServices],
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit((data) => {
      createRuleMutation.mutate(
        {
          type: data.type,
          value: parseMoneyInput(data.value) ?? 0,
          effectiveFrom: data.effectiveFrom,
          ...(data.storeMemberId !== ALL_OPTION && {
            storeMemberId: data.storeMemberId,
          }),
          ...(data.serviceId !== ALL_OPTION && { serviceId: data.serviceId }),
        },
        {
          onSuccess: () => {
            toast.success('Regra salva');
            form.reset(getEmptyValues());
          },
          onError: (error) => setSubmitError(getRuleError(error)),
        },
      );
    })(event);
  };

  return {
    form,
    errors: form.formState.errors,
    type,
    valuePlaceholder: type === 'percent' ? '40%' : formatMoney(10),
    memberOptions,
    serviceOptions,
    submitError,
    isSubmitting: createRuleMutation.isPending,
    handleSubmit,
  };
};
