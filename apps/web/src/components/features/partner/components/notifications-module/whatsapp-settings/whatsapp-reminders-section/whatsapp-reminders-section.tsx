'use client';

import { MessageCircle } from 'lucide-react';
import { NotificationPreviewModal } from '../../components/notification-preview-modal';
import { ReminderChannelCard } from '../../components/reminder-channel-card';
import type { TWhatsappSettingsFormData } from '../whatsapp-settings.schema';
import { useWhatsappRemindersSection } from './whatsapp-reminders-section.hook';
import type { TWhatsappRemindersSectionConfig } from './whatsapp-reminders-section.types';

export const WhatsappRemindersSection = ({
  isSaving,
  onSubmit,
  lockedHint,
}: TWhatsappRemindersSectionConfig) => {
  const {
    customMessage,
    timingOptions,
    previewModal,
    openPreview,
    closePreview,
  } = useWhatsappRemindersSection();

  return (
    <>
      <ReminderChannelCard<TWhatsappSettingsFormData>
        icon={MessageCircle}
        title="Lembretes por WhatsApp"
        description="Mensagens instantâneas para seus clientes"
        enabledName="whatsappReminderEnabled"
        timingName="whatsappReminderAdvanceHours"
        messageName="whatsappReminderCustomMessage"
        timingOptions={timingOptions}
        messageLimit={300}
        messageHint="Até 300 caracteres. Emojis permitidos"
        messagePlaceholder="Ex: Olá! Confirmando seu horário para amanhã. Nos vemos em breve! 😊"
        previewLabel="Ver prévia do WhatsApp"
        onOpenPreview={openPreview}
        isSaving={isSaving}
        onSubmit={onSubmit}
        lockedHint={lockedHint}
      />

      <NotificationPreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        type="whatsapp"
        customMessage={customMessage}
      />
    </>
  );
};
