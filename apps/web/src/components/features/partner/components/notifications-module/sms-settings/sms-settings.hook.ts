import { useNotificationsMutations } from '@/hooks/partner/use-notifications-mutations/use-notifications-mutations.hook';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useReminderSettingsLoad } from '../notifications-module.hook';
import type { TNotificationsSettingsData } from '../notifications-module.types';
import { smsSettingsSchema, TSmsSettingsFormData } from './sms-settings.schema';

const getSmsFormValues = (
  settings: TNotificationsSettingsData,
): TSmsSettingsFormData => ({
  smsReminderEnabled: settings?.smsReminderEnabled ?? false,
  smsReminderAdvanceHours: settings?.smsReminderAdvanceHours ?? '24h',
  smsReminderCustomMessage: settings?.smsReminderCustomMessage ?? '',
});

export const useSmsSettings = () => {
  const form = useForm<TSmsSettingsFormData>({
    resolver: zodResolver(smsSettingsSchema),
    defaultValues: getSmsFormValues(null),
  });

  const { storeId, notificationsSettings, loadState, handleRetry, isRetrying } =
    useReminderSettingsLoad({
      reset: form.reset,
      getFormValues: getSmsFormValues,
    });

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

  return {
    form,
    isUpdatingNotificationsSettings:
      updateNotificationsSettingsMutation.isPending,
    handleSubmit,
    loadState,
    handleRetry,
    isRetrying,
  };
};
