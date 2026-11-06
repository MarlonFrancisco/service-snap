import { useNotificationsMutations } from '@/hooks/partner/use-notifications-mutations';
import { useAnalytics } from '@/providers/analytics.provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useReminderSettingsLoad } from '../notifications-module.hook';
import type { TNotificationsSettingsData } from '../notifications-module.types';
import { parseAdvanceHours } from '../notifications-module.utils';
import {
  emailSettingsSchema,
  TEmailSettingsFormData,
} from './email-settings.schema';

const getEmailFormValues = (
  settings: TNotificationsSettingsData,
): TEmailSettingsFormData => ({
  emailReminderEnabled: settings?.emailReminderEnabled ?? false,
  emailReminderAdvanceHours: settings?.emailReminderAdvanceHours ?? '24h',
  emailReminderCustomMessage: settings?.emailReminderCustomMessage ?? '',
});

export const useSettings = () => {
  const analytics = useAnalytics();
  const form = useForm<TEmailSettingsFormData>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: getEmailFormValues(null),
  });

  const { storeId, notificationsSettings, loadState, handleRetry, isRetrying } =
    useReminderSettingsLoad({
      reset: form.reset,
      getFormValues: getEmailFormValues,
    });

  const { updateNotificationsSettingsMutation } = useNotificationsMutations({
    storeId,
    notificationHistoryParams: {},
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    updateNotificationsSettingsMutation.mutate(
      {
        ...data,
        id: notificationsSettings?.id,
      },
      {
        onSuccess: () =>
          analytics.track('reminder_settings_updated', {
            channel: 'email',
            enabled: Boolean(data.emailReminderEnabled),
            advance_hours: parseAdvanceHours(data.emailReminderAdvanceHours),
          }),
      },
    );
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
