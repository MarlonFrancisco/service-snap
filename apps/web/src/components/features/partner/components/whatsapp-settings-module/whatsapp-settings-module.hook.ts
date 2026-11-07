import { useWhatsappMutation } from '@/hooks/partner';
import { useWhatsappQuery } from '@/hooks/use-query/use-whatsapp-query';
import { isNotFoundError } from '@/service/api';
import type { IWhatsappIdsSuggestion } from '@/types/api/whatsapp.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useStoreAvailability } from '../notifications-module/notifications-module.hook';
import {
  IWhatsappSettingsSchema,
  whatsappSettingsSchema,
} from './whatsapp-settings.schema';
import { getStatusBadge, maskToken } from './whatsapp-settings-module.utils';

const EMPTY_FORM_VALUES: IWhatsappSettingsSchema = {
  isActive: false,
  phoneNumberId: '',
  businessAccountId: '',
  accessToken: '',
  webhookVerifyToken: '',
};

export const useWhatsappSettingsModule = () => {
  const { saveConfig, isSaveConfigPending, sendTest, isSendTestPending } =
    useWhatsappMutation();
  const { storeId, storeAvailability, retryStore } = useStoreAvailability();
  const {
    whatsappConfig,
    isWhatsappError,
    whatsappError,
    isWhatsappFetching,
    refetchWhatsapp,
    whatsappStatus,
    isWhatsappStatusPending,
    isWhatsappStatusError,
    isWhatsappStatusFetching,
    refetchWhatsappStatus,
    whatsappTemplates,
    isWhatsappTemplatesPending,
    isWhatsappTemplatesError,
    whatsappTemplatesError,
    isWhatsappTemplatesFetching,
    refetchWhatsappTemplates,
  } = useWhatsappQuery(storeId);

  const [testPhone, setTestPhone] = useState('');
  const [syncedConfig, setSyncedConfig] = useState<typeof whatsappConfig>();

  const form = useForm<IWhatsappSettingsSchema>({
    resolver: zodResolver(whatsappSettingsSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });
  const { reset } = form;

  useEffect(() => {
    if (!whatsappConfig) return;

    reset({
      isActive: whatsappConfig.isActive ?? false,
      phoneNumberId: whatsappConfig.phoneNumberId || '',
      businessAccountId: whatsappConfig.businessAccountId || '',
      accessToken: whatsappConfig.accessToken || '',
      webhookVerifyToken: whatsappConfig.webhookVerifyToken || '',
    });
    setSyncedConfig(whatsappConfig);
  }, [whatsappConfig, reset]);

  // 404 significa "sem configuração": o formulário vazio é o estado certo para criar uma.
  const isConfigMissing = isWhatsappError && isNotFoundError(whatsappError);
  const hasConfigFailed =
    isWhatsappError && !isConfigMissing && !whatsappConfig;

  const isFormReady = whatsappConfig
    ? syncedConfig === whatsappConfig
    : isConfigMissing;
  const isLoading =
    storeAvailability === 'loading' ||
    (storeAvailability === 'ready' && !hasConfigFailed && !isFormReady);
  const isError =
    storeAvailability === 'error' ||
    (storeAvailability === 'ready' && hasConfigFailed);

  const handleRetry = useCallback(() => {
    if (storeAvailability !== 'ready') {
      retryStore();
      return;
    }
    void refetchWhatsapp();
  }, [storeAvailability, retryStore, refetchWhatsapp]);

  const handleSubmit = form.handleSubmit(async (data) => {
    saveConfig({
      ...data,
      id: whatsappConfig?.id,
      store: { id: storeId },
    });
  });

  // Troca o par de IDs e já salva: o status é refeito com os IDs novos.
  const handleUseSuggestion = (suggestion: IWhatsappIdsSuggestion) => {
    form.setValue('phoneNumberId', suggestion.phoneNumberId, {
      shouldDirty: true,
    });
    form.setValue('businessAccountId', suggestion.businessAccountId, {
      shouldDirty: true,
    });
    void handleSubmit();
  };

  const handleSendTest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!testPhone.trim()) return;
    sendTest({
      storeId,
      payload: { to: testPhone.trim() },
    });
  };

  const handleCopyWebhookToken = async () => {
    const token = form.getValues('webhookVerifyToken');
    if (!token) return;

    try {
      await navigator.clipboard.writeText(token);
      toast.success('Token copiado para a área de transferência!');
    } catch {
      toast.error('Falha ao copiar. Tente novamente.');
    }
  };

  const isConnected = whatsappStatus?.status === 'connected';
  const connectionIssues = (whatsappStatus?.checks ?? []).filter(
    (check) => check.state !== 'ok',
  );
  const webhookToken = form.watch('webhookVerifyToken');
  // O status confere o que está salvo: com o formulário alterado, o resultado é do valor antigo.
  const { dirtyFields } = form.formState;
  const hasUnsavedCredentials = Boolean(
    dirtyFields.phoneNumberId ||
      dirtyFields.businessAccountId ||
      dirtyFields.accessToken,
  );

  return {
    isLoading,
    isError,
    hasNoStore: storeAvailability === 'no-store',
    // Sem `id`, a API devolve só o token do webhook: a loja nunca salvou credenciais.
    isConfigured: Boolean(whatsappConfig?.id),
    handleRetry,
    isRetrying: isWhatsappFetching,
    isSaveConfigPending,
    form,
    handleSubmit,
    whatsappStatus,
    isConnected,
    connectionIssues,
    handleUseSuggestion,
    hasUnsavedCredentials,
    statusBadge: getStatusBadge({
      status: whatsappStatus?.status,
      isError: isWhatsappStatusError,
    }),
    isCheckingStatus: isWhatsappStatusPending && !isWhatsappStatusError,
    isWhatsappStatusError,
    isWhatsappStatusFetching,
    refetchWhatsappStatus,
    whatsappTemplates,
    isLoadingTemplates: isConnected && isWhatsappTemplatesPending,
    isWhatsappTemplatesError,
    templatesErrorMessage:
      whatsappTemplatesError instanceof Error
        ? whatsappTemplatesError.message
        : 'Não foi possível carregar os templates.',
    isWhatsappTemplatesFetching,
    refetchWhatsappTemplates,
    testPhone,
    setTestPhone,
    handleSendTest,
    isSendTestPending,
    webhookTokenLabel: maskToken(webhookToken),
    hasWebhookToken: Boolean(webhookToken),
    handleCopyWebhookToken,
  };
};
