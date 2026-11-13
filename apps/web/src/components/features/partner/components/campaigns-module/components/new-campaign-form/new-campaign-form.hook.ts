'use client';

import { useCampaignsMutations } from '@/hooks/partner/use-campaigns-mutations';
import { useCampaignTemplatesQuery } from '@/hooks/partner/use-campaigns-query';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { formatDay } from '../../../customers-module/customers-module.helpers';
import { MIN_PLAN_BY_FEATURE } from '../../../plan-feature-gate/plan-feature-gate.constants';
import {
  formatCustomersCount,
  MAX_EMAIL_MESSAGE,
  MAX_TEMPLATE_VARIABLES,
  previewBodyParam,
} from '../../campaigns-module.helpers';
import {
  getCreateCampaignError,
  toCampaignPayloads,
  toTemplateOptions,
} from './new-campaign-form.helpers';
import {
  NEW_CAMPAIGN_EMPTY_VALUES,
  NEW_CAMPAIGN_VARIABLE,
  newCampaignSchema,
  type TNewCampaignSchema,
} from './new-campaign-form.schema';
import type {
  TTemplatePreviewParam,
  TUseNewCampaignFormConfig,
  TWhatsappCampaignState,
} from './new-campaign-form.types';

export const useNewCampaignForm = ({
  storeId,
  storeName,
  audience,
  hasWhatsappPlan,
}: TUseNewCampaignFormConfig) => {
  const usesWhatsapp = audience.channel !== 'email';
  const usesEmail = audience.channel !== 'whatsapp';
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const { createCampaignMutation } = useCampaignsMutations({ storeId });

  const form = useForm<TNewCampaignSchema>({
    resolver: zodResolver(newCampaignSchema),
    defaultValues: { ...NEW_CAMPAIGN_EMPTY_VALUES, channel: audience.channel },
  });
  const variables = useFieldArray({ control: form.control, name: 'variables' });
  const [templateKey, watchedVariables, message] = useWatch({
    control: form.control,
    name: ['templateKey', 'variables', 'message'],
  });

  // O canal mora na tela (a tabela depende dele); o formulário só valida
  useEffect(() => {
    form.setValue('channel', audience.channel);
    if (form.formState.isSubmitted) void form.trigger();
  }, [audience.channel, form]);

  const {
    templates,
    isLoadingTemplates,
    isTemplatesError,
    isFetchingTemplates,
    refetchTemplates,
  } = useCampaignTemplatesQuery({
    storeId,
    enabled: usesWhatsapp && hasWhatsappPlan,
  });
  const templateOptions = useMemo(
    () => toTemplateOptions(templates),
    [templates],
  );

  // Com um template só, ele já vem escolhido
  useEffect(() => {
    const firstOption = templateOptions[0];
    if (
      !form.getValues('templateKey') &&
      templateOptions.length === 1 &&
      firstOption
    ) {
      form.setValue('templateKey', firstOption.key);
    }
  }, [templateOptions, form]);

  const getWhatsappState = (): TWhatsappCampaignState => {
    if (!hasWhatsappPlan) return 'no-plan';
    if (isLoadingTemplates) return 'loading';
    if (isTemplatesError) return 'not-connected';
    if (templateOptions.length === 0) return 'no-template';
    return 'ready';
  };
  const whatsappState = getWhatsappState();

  const sampleName = audience.sample?.firstName?.trim() || 'Cliente';
  const previewValues = {
    customerName: sampleName,
    storeName: storeName || 'a loja',
  };
  const previewParams: TTemplatePreviewParam[] = watchedVariables.map(
    (variable, index) => ({
      position: index + 1,
      value: previewBodyParam(variable, previewValues),
    }),
  );
  const selectedTemplate = templateOptions.find(
    (option) => option.key === templateKey,
  );

  const handleAddVariable = useCallback(() => {
    if (variables.fields.length < MAX_TEMPLATE_VARIABLES) {
      variables.append(NEW_CAMPAIGN_VARIABLE);
    }
  }, [variables]);

  const canSend =
    audience.total > 0 && (!usesWhatsapp || whatsappState === 'ready');
  // O envio de "Os dois" são duas chamadas: o formulário segura o estado entre elas
  const isSending =
    form.formState.isSubmitting || createCampaignMutation.isPending;

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit(async (values) => {
      const payloads = toCampaignPayloads(values, audience);

      if (!payloads.length) {
        setSubmitError(
          'Marque pelo menos um cliente que tenha o contato do canal.',
        );
        return;
      }

      const errors: string[] = [];

      // Um canal por vez: se um falhar, o outro ainda sai
      for (const payload of payloads) {
        try {
          await createCampaignMutation.mutateAsync(payload);
        } catch (error) {
          errors.push(getCreateCampaignError(error, payload.channel));
        }
      }

      const created = payloads.length - errors.length;

      if (created) {
        toast.success(created > 1 ? 'Campanhas criadas' : 'Campanha criada', {
          description: 'As mensagens saem aos poucos. Acompanhe na lista.',
        });
        form.reset({
          ...NEW_CAMPAIGN_EMPTY_VALUES,
          channel: audience.channel,
          templateKey: values.templateKey,
          variables: values.variables,
        });
      }
      if (errors.length) setSubmitError(errors.join(' '));
    })(event);
  };

  return {
    form,
    usesWhatsapp,
    usesEmail,
    whatsappState,
    whatsappPlanName: MIN_PLAN_BY_FEATURE.WHATSAPP_INTEGRATION,
    isRetryingTemplates: isFetchingTemplates,
    handleRetryTemplates: () => void refetchTemplates(),
    templateOptions,
    templatePreviewName: selectedTemplate?.name ?? null,
    previewParams,
    variableFields: variables.fields,
    variableSources: watchedVariables.map((variable) => variable.source),
    canAddVariable: variables.fields.length < MAX_TEMPLATE_VARIABLES,
    handleAddVariable,
    handleRemoveVariable: variables.remove,
    messageCount: `${message.trim().length}/${MAX_EMAIL_MESSAGE}`,
    isEmailPreviewOpen,
    setIsEmailPreviewOpen,
    emailPreview: {
      storeName: storeName || 'Sua loja',
      customerName: sampleName,
      message: message.trim() || 'O texto que você escrever aparece aqui.',
      lastVisit: formatDay(audience.sample?.lastVisit) || 'dd/mm/aaaa',
      year: new Date().getFullYear(),
    },
    sendLabel: `Enviar para ${formatCustomersCount(audience.total)}`,
    canSend,
    isSending,
    submitError,
    handleSubmit,
  };
};
