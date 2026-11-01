import { useNotificationsMutations } from '@/hooks/partner/use-notifications-mutations/use-notifications-mutations.hook';
import { useWhatsappQuery } from '@/hooks/use-query/use-whatsapp-query/use-whatsapp-query.hook';
import { isNotFoundError } from '@/service/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useReminderSettingsLoad } from '../notifications-module.hook';
import type { TNotificationsSettingsData } from '../notifications-module.types';
import {
  TWhatsappSettingsFormData,
  whatsappSettingsSchema,
} from './whatsapp-settings.schema';

const getWhatsappFormValues = (
  settings: TNotificationsSettingsData,
): TWhatsappSettingsFormData => ({
  whatsappReminderEnabled: settings?.whatsappReminderEnabled ?? false,
  whatsappReminderAdvanceHours: settings?.whatsappReminderAdvanceHours ?? '24h',
  whatsappReminderCustomMessage: settings?.whatsappReminderCustomMessage ?? '',
});

export const useWhatsappSettings = () => {
  const form = useForm<TWhatsappSettingsFormData>({
    resolver: zodResolver(whatsappSettingsSchema),
    defaultValues: getWhatsappFormValues(null),
  });

  const { storeId, notificationsSettings, loadState, handleRetry, isRetrying } =
    useReminderSettingsLoad({
      reset: form.reset,
      getFormValues: getWhatsappFormValues,
    });

  const { whatsappConfig, isWhatsappPending, isWhatsappError, whatsappError } =
    useWhatsappQuery(storeId);

  const { updateNotificationsSettingsMutation } = useNotificationsMutations({
    storeId,
    notificationHistoryParams: {},
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    updateNotificationsSettingsMutation.mutate({
      ...data,
      id: notificationsSettings?.id,
    });
  });

  // Não afirma que falta ativar enquanto carrega ou quando a leitura falhou.
  const isConfigUnknown =
    isWhatsappPending || (isWhatsappError && !isNotFoundError(whatsappError));

  return {
    form,
    isUpdatingNotificationsSettings:
      updateNotificationsSettingsMutation.isPending,
    showActivationNotice: !isConfigUnknown && !whatsappConfig?.isActive,
    handleSubmit,
    loadState,
    handleRetry,
    isRetrying,
  };
};
