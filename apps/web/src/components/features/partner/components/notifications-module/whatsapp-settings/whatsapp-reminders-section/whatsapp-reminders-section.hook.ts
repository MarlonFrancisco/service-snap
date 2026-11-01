import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { TWhatsappSettingsFormData } from '../whatsapp-settings.schema';
import { ITimingOption } from './whatsapp-reminders-section.types';

export const useWhatsappRemindersSection = () => {
  const form = useFormContext<TWhatsappSettingsFormData>();
  const customMessage = form.watch('whatsappReminderCustomMessage') || '';

  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
  });

  const timingOptions: ITimingOption[] = [
    { value: '2h', label: '2 horas antes' },
    { value: '6h', label: '6 horas antes' },
    { value: '12h', label: '12 horas antes' },
    { value: '24h', label: '1 dia antes' },
    { value: '48h', label: '2 dias antes' },
    { value: '72h', label: '3 dias antes' },
  ];

  const openPreview = () => {
    setPreviewModal({ isOpen: true });
  };

  const closePreview = () => {
    setPreviewModal({ isOpen: false });
  };

  return {
    form,
    customMessage,
    timingOptions,
    previewModal,
    openPreview,
    closePreview,
  };
};
