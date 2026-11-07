import { useWhatsappMutation } from '@/hooks/partner';
import { useWhatsappQuery } from '@/hooks/use-query/use-whatsapp-query';
import type { IWhatsappIdsSuggestion } from '@/types/api/whatsapp.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useStoreAvailability } from '../../notifications-module/notifications-module.hook';
import {
  IWhatsappSettingsSchema,
  whatsappSettingsSchema,
} from '../whatsapp-settings.schema';
import { maskToken } from '../whatsapp-settings-module.utils';
import {
  WHATSAPP_GUIDE_LAST_STEP,
  WHATSAPP_GUIDE_STEP_FIELDS,
  WHATSAPP_GUIDE_STEPS,
  WHATSAPP_WEBHOOK_URL,
} from './whatsapp-connect-guide.constants';

const EMPTY_FORM_VALUES: IWhatsappSettingsSchema = {
  isActive: true,
  phoneNumberId: '',
  businessAccountId: '',
  accessToken: '',
  webhookVerifyToken: '',
};

export const useWhatsappConnectGuide = (initialStep: number) => {
  const { storeId, storeAvailability, retryStore } = useStoreAvailability();
  const {
    whatsappConfig,
    isWhatsappPending,
    isWhatsappError,
    isWhatsappFetching,
    refetchWhatsapp,
    whatsappStatus,
    isWhatsappStatusFetching,
  } = useWhatsappQuery(storeId);
  const { saveConfig, isSaveConfigPending } = useWhatsappMutation();

  const [step, setStep] = useState(initialStep);
  const [hasVerified, setHasVerified] = useState(false);

  const form = useForm<IWhatsappSettingsSchema>({
    resolver: zodResolver(whatsappSettingsSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });
  const { reset, trigger, handleSubmit } = form;

  // Preenche uma vez com o que já foi salvo; depois disso o que a pessoa digita manda.
  const hasHydrated = useRef(false);
  useEffect(() => {
    if (!whatsappConfig || hasHydrated.current) return;
    hasHydrated.current = true;
    reset({
      isActive: true,
      phoneNumberId: whatsappConfig.phoneNumberId || '',
      businessAccountId: whatsappConfig.businessAccountId || '',
      accessToken: whatsappConfig.accessToken || '',
      webhookVerifyToken: whatsappConfig.webhookVerifyToken || '',
    });
  }, [whatsappConfig, reset]);

  const goToStep = useCallback((next: number) => {
    setStep(Math.min(Math.max(next, 0), WHATSAPP_GUIDE_LAST_STEP));
    window.scrollTo({ top: 0 });
  }, []);

  const handleNext = async () => {
    const fields = WHATSAPP_GUIDE_STEP_FIELDS[step];
    if (fields && !(await trigger(fields))) return;
    goToStep(step + 1);
  };

  const handlePrev = () => goToStep(step - 1);

  const handleVerify = handleSubmit(
    (data) => {
      saveConfig(
        {
          ...data,
          isActive: true,
          id: whatsappConfig?.id,
          store: { id: storeId },
        },
        { onSuccess: () => setHasVerified(true) },
      );
    },
    (errors) => {
      // O campo com erro pode estar numa etapa anterior: leva até ela.
      if (errors.phoneNumberId || errors.businessAccountId) goToStep(3);
      else if (errors.accessToken) goToStep(4);
    },
  );

  // Troca o par de IDs pelo sugerido e verifica de novo na mesma hora.
  const handleUseSuggestion = (suggestion: IWhatsappIdsSuggestion) => {
    form.setValue('phoneNumberId', suggestion.phoneNumberId, {
      shouldDirty: true,
    });
    form.setValue('businessAccountId', suggestion.businessAccountId, {
      shouldDirty: true,
    });
    void handleVerify();
  };

  const copy = async (value: string, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado.`);
    } catch {
      toast.error('Falha ao copiar. Tente novamente.');
    }
  };

  const webhookToken = whatsappConfig?.webhookVerifyToken || '';
  const checks = whatsappStatus?.checks ?? [];
  const isVerifying =
    isSaveConfigPending || (hasVerified && isWhatsappStatusFetching);
  const hasResult = hasVerified && !isVerifying && Boolean(whatsappStatus);
  const isConnected =
    hasResult &&
    whatsappStatus?.status === 'connected' &&
    !checks.some((check) => check.state === 'error');

  const handleRetry = () => {
    if (storeAvailability !== 'ready') {
      retryStore();
      return;
    }
    void refetchWhatsapp();
  };

  return {
    hasNoStore: storeAvailability === 'no-store',
    isLoading:
      storeAvailability === 'loading' ||
      (storeAvailability === 'ready' && isWhatsappPending),
    isError:
      storeAvailability === 'error' ||
      (storeAvailability === 'ready' && isWhatsappError && !whatsappConfig),
    handleRetry,
    isRetrying: isWhatsappFetching,
    form,
    step,
    steps: WHATSAPP_GUIDE_STEPS,
    lastStep: WHATSAPP_GUIDE_LAST_STEP,
    progress: Math.round((step / WHATSAPP_GUIDE_LAST_STEP) * 100),
    goToStep,
    handleNext,
    handlePrev,
    handleVerify,
    isVerifying,
    hasResult,
    isConnected,
    checks,
    handleUseSuggestion,
    whatsappStatus,
    storeId,
    webhookUrl: WHATSAPP_WEBHOOK_URL,
    webhookTokenLabel: maskToken(webhookToken),
    hasWebhookToken: Boolean(webhookToken),
    handleCopyWebhookUrl: () => void copy(WHATSAPP_WEBHOOK_URL, 'URL'),
    handleCopyWebhookToken: () => void copy(webhookToken, 'Token'),
  };
};
