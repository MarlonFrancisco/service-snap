'use client';

import { FormProvider } from 'react-hook-form';
import { ReminderChannelLayout } from '../components/reminder-channel-card';
import { EmailRemindersSection } from './email-reminders-section';
import { useSettings } from './email-settings.hook';

export const EmailSettings = () => {
  const {
    form,
    isUpdatingNotificationsSettings,
    handleSubmit,
    loadState,
    handleRetry,
    isRetrying,
  } = useSettings();

  return (
    <ReminderChannelLayout
      title="Configurações de e-mail"
      description="Configure lembretes automáticos por e-mail para seus clientes"
      loadState={loadState}
      onRetry={handleRetry}
      isRetrying={isRetrying}
    >
      <FormProvider {...form}>
        <EmailRemindersSection
          isSaving={isUpdatingNotificationsSettings}
          onSubmit={handleSubmit}
        />
      </FormProvider>
    </ReminderChannelLayout>
  );
};
