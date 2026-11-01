'use client';

import { FormProvider } from 'react-hook-form';
import { ReminderChannelLayout } from '../components/reminder-channel-card';
import { SmsRemindersSection } from './sms-reminders-section';
import { useSmsSettings } from './sms-settings.hook';

export const SmsSettings = () => {
  const {
    form,
    isUpdatingNotificationsSettings,
    handleSubmit,
    loadState,
    handleRetry,
    isRetrying,
  } = useSmsSettings();

  return (
    <ReminderChannelLayout
      title="Configurações de SMS"
      description="Configure lembretes automáticos por SMS para seus clientes"
      loadState={loadState}
      onRetry={handleRetry}
      isRetrying={isRetrying}
    >
      <FormProvider {...form}>
        <SmsRemindersSection
          isSaving={isUpdatingNotificationsSettings}
          onSubmit={handleSubmit}
        />
      </FormProvider>
    </ReminderChannelLayout>
  );
};
