'use client';

import { useApiKeysMutations } from '@/hooks/partner/use-api-keys-mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getApiKeyCreateError } from '../../../integrations-module.helpers';
import {
  NEW_API_KEY_EMPTY_VALUES,
  newApiKeySchema,
  type TNewApiKeySchema,
} from './new-api-key-dialog.schema';
import type { TNewApiKeyDialogConfig } from './new-api-key-dialog.types';

export const useNewApiKeyDialog = ({
  storeId,
  isOpen,
  onOpenChange,
  onCreated,
}: TNewApiKeyDialogConfig) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createApiKeyMutation } = useApiKeysMutations({ storeId });
  const { mutate, reset, isPending } = createApiKeyMutation;

  const form = useForm<TNewApiKeySchema>({
    resolver: zodResolver(newApiKeySchema),
    defaultValues: NEW_API_KEY_EMPTY_VALUES,
  });

  // Cada abertura começa limpa
  useEffect(() => {
    if (isOpen) {
      form.reset(NEW_API_KEY_EMPTY_VALUES);
      setSubmitError(null);
    }
  }, [isOpen, form]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isPending) return;
      onOpenChange(nextOpen);
    },
    [onOpenChange, isPending],
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit(({ name }) => {
      mutate(
        { name },
        {
          onSuccess: (apiKey) => {
            onCreated(apiKey);
            // A chave fica só na tela, não no cache das mutações
            reset();
            onOpenChange(false);
          },
          onError: (error) => setSubmitError(getApiKeyCreateError(error)),
        },
      );
    })(event);
  };

  return {
    form,
    submitError,
    isSubmitting: isPending,
    handleOpenChange,
    handleSubmit,
  };
};
