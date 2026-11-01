'use client';

import { Smartphone } from 'lucide-react';
import { NotificationPreviewModal } from '../../components/notification-preview-modal';
import { ReminderChannelCard } from '../../components/reminder-channel-card';
import type { TSmsSettingsFormData } from '../sms-settings.schema';
import { useSmsRemindersSection } from './sms-reminders-section.hook';
import type { TSmsRemindersSectionConfig } from './sms-reminders-section.types';

export const SmsRemindersSection = ({
  isSaving,
  onSubmit,
}: TSmsRemindersSectionConfig) => {
  const {
    customMessage,
    timingOptions,
    previewModal,
    openPreview,
    closePreview,
  } = useSmsRemindersSection();

  return (
    <>
      <ReminderChannelCard<TSmsSettingsFormData>
        icon={Smartphone}
        title="Lembretes por SMS"
        description="Mensagens de texto para maior alcance"
        enabledName="smsReminderEnabled"
        timingName="smsReminderAdvanceHours"
        messageName="smsReminderCustomMessage"
        timingOptions={timingOptions}
        messageLimit={50}
        messageHint="Até 50 caracteres"
        messagePlaceholder="Ex: Até amanhã! - Equipe Barbearia"
        previewLabel="Ver prévia do SMS"
        onOpenPreview={openPreview}
        isSaving={isSaving}
        onSubmit={onSubmit}
      />

      <NotificationPreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        type="sms"
        customMessage={customMessage}
      />
    </>
  );
};
