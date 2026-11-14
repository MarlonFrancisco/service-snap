'use client';

import { useLoyaltyMutations } from '@/hooks/partner/use-loyalty-mutations';
import { useLoyaltyProgramQuery } from '@/hooks/partner/use-loyalty-query';
import { isApiHttpError } from '@/service/api';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import {
  useRetentionAccess,
  useStoreServiceOptions,
} from '../packages-module/packages-module.hook';
import type { TRetentionView } from '../packages-module/packages-module.types';
import {
  toLoyaltyFormValues,
  toLoyaltyPayload,
} from './loyalty-module.helpers';
import {
  loyaltyProgramSchema,
  type TLoyaltyProgramSchema,
} from './loyalty-module.schema';

const getSaveError = (error: unknown) => {
  if (isApiHttpError(error) && error.status === 403) {
    return 'Só o dono e o gerente da loja mudam o programa de fidelidade.';
  }
  if (isApiHttpError(error) && error.status === 400) {
    return 'Confira a recompensa e os serviços escolhidos.';
  }

  return 'Não foi possível salvar o programa. Tente de novo.';
};

export const useLoyaltyModule = () => {
  const { storeId, storeState, isProfessional } = useRetentionAccess();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const canQuery = storeState === 'ready' && !isProfessional;

  const {
    program,
    isLoadingProgram,
    isFetchingProgram,
    isProgramError,
    refetchProgram,
  } = useLoyaltyProgramQuery({ storeId, enabled: canQuery });
  const { serviceOptions, isLoadingServices } = useStoreServiceOptions(
    storeId,
    canQuery,
  );
  const { saveProgramMutation } = useLoyaltyMutations({ storeId });

  const form = useForm<TLoyaltyProgramSchema>({
    resolver: zodResolver(loyaltyProgramSchema),
    defaultValues: toLoyaltyFormValues(program),
  });
  const [servicesScope, rewardType, eligibleServiceIds] = useWatch({
    control: form.control,
    name: ['servicesScope', 'rewardType', 'eligibleServiceIds'],
  });

  // O que está salvo (ou o programa de outra loja) volta para o formulário
  useEffect(() => {
    if (!isLoadingProgram) form.reset(toLoyaltyFormValues(program));
  }, [program, isLoadingProgram, form, storeId]);

  const getView = (): TRetentionView => {
    if (storeState === 'no-store') return 'no-store';
    if (isProfessional) return 'no-access';
    if (storeState === 'error' || isProgramError) return 'error';
    if (storeState === 'loading' || isLoadingProgram) return 'loading';
    return 'ready';
  };

  const handleToggleService = useCallback(
    (serviceId: string) => {
      const current = form.getValues('eligibleServiceIds');
      const next = current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId];

      form.setValue('eligibleServiceIds', next, {
        shouldDirty: true,
        shouldValidate: form.formState.isSubmitted,
      });
    },
    [form],
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit((values) => {
      saveProgramMutation.mutate(toLoyaltyPayload(values), {
        onSuccess: () => toast.success('Programa salvo'),
        onError: (error) => setSubmitError(getSaveError(error)),
      });
    })(event);
  };

  return {
    view: getView(),
    isRetrying: isFetchingProgram,
    handleRetry: () => void refetchProgram(),
    form,
    isNewProgram: !program,
    servicesScope,
    rewardType,
    serviceOptions: serviceOptions.map((option) => ({
      ...option,
      isChecked: eligibleServiceIds.includes(option.id),
    })),
    isLoadingServices,
    handleToggleService,
    servicesError: form.formState.errors.eligibleServiceIds?.message,
    submitError,
    isSaving: saveProgramMutation.isPending,
    handleSubmit,
  };
};
