'use client';

import { Mail } from 'lucide-react';
import { NotificationPreviewModal } from '../../components/notification-preview-modal';
import { ReminderChannelCard } from '../../components/reminder-channel-card';
import type { TEmailSettingsFormData } from '../email-settings.schema';
import { useEmailRemindersSection } from './email-reminders-section.hook';
import type { TEmailRemindersSectionConfig } from './email-reminders-section.types';

export const EmailRemindersSection = ({
  isSaving,
  onSubmit,
}: TEmailRemindersSectionConfig) => {
  const {
    customMessage,
    timingOptions,
    previewModal,
    openPreview,
    closePreview,
  } = useEmailRemindersSection();

  return (
    <>
      <ReminderChannelCard<TEmailSettingsFormData>
        icon={Mail}
        title="Lembretes por e-mail"
        description="Envio automático de lembretes para clientes"
        enabledName="emailReminderEnabled"
        timingName="emailReminderAdvanceHours"
        messageName="emailReminderCustomMessage"
        timingOptions={timingOptions}
        messageLimit={200}
        messageHint="Até 200 caracteres"
        messagePlaceholder="Ex: Estamos ansiosos para atendê-lo! Caso precise remarcar, use o link abaixo."
        previewLabel="Ver prévia do e-mail"
        onOpenPreview={openPreview}
        isSaving={isSaving}
        onSubmit={onSubmit}
      />

      <NotificationPreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        type="email"
        customMessage={customMessage}
      />
    </>
  );
};
