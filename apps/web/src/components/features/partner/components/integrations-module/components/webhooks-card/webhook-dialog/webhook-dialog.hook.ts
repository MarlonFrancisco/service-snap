'use client';

import { useWebhooksMutations } from '@/hooks/partner/use-webhooks-mutations';
import type { TWebhookSubscribableEvent } from '@/types/api/webhooks.types';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getWebhookSaveError } from '../../../integrations-module.helpers';
import {
  getWebhookFormValues,
  webhookSchema,
  type TWebhookSchema,
} from './webhook-dialog.schema';
import type { TWebhookDialogConfig } from './webhook-dialog.types';

export const useWebhookDialog = ({
  storeId,
  isOpen,
  endpoint,
  onOpenChange,
  onCreated,
}: TWebhookDialogConfig) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createWebhookMutation, updateWebhookMutation } = useWebhooksMutations(
    { storeId },
  );
  const isEditing = !!endpoint;
  const isSubmitting =
    createWebhookMutation.isPending || updateWebhookMutation.isPending;

  const form = useForm<TWebhookSchema>({
    resolver: zodResolver(webhookSchema),
    defaultValues: getWebhookFormValues(endpoint),
  });

  // Cada abertura começa com os dados do endpoint (ou em branco)
  useEffect(() => {
    if (isOpen) {
      form.reset(getWebhookFormValues(endpoint));
      setSubmitError(null);
    }
  }, [isOpen, endpoint, form]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isSubmitting) return;
      onOpenChange(nextOpen);
    },
    [onOpenChange, isSubmitting],
  );

  const toggleEvent = useCallback(
    (
      events: TWebhookSubscribableEvent[],
      event: TWebhookSubscribableEvent,
      isChecked: boolean,
    ) =>
      isChecked
        ? [...events.filter((item) => item !== event), event]
        : events.filter((item) => item !== event),
    [],
  );

  const handleSubmit = (formEvent?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit(({ url, description, events, isActive }) => {
      const onError = (error: unknown) =>
        setSubmitError(getWebhookSaveError(error));

      if (endpoint) {
        updateWebhookMutation.mutate(
          {
            id: endpoint.id,
            changes: { url, description, events, isActive },
          },
          {
            onSuccess: () => {
              toast.success('Webhook salvo');
              onOpenChange(false);
            },
            onError,
          },
        );
        return;
      }

      createWebhookMutation.mutate(
        { url, events, ...(description && { description }) },
        {
          onSuccess: (created) => {
            onCreated(created);
            // O segredo fica só na tela, não no cache das mutações
            createWebhookMutation.reset();
            onOpenChange(false);
          },
          onError,
        },
      );
    })(formEvent);
  };

  return {
    form,
    isEditing,
    submitError,
    isSubmitting,
    handleOpenChange,
    handleSubmit,
    toggleEvent,
  };
};
