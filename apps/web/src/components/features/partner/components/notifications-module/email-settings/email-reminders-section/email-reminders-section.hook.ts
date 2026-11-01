'use client';
import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { type TEmailSettingsFormData } from '../email-settings.schema';
import type { TTimingOption } from './email-reminders-section.types';

const TIMING_OPTIONS: TTimingOption[] = [
  { value: '48h', label: '48 horas antes' },
  { value: '24h', label: '24 horas antes' },
  { value: '12h', label: '12 horas antes' },
  { value: '2h', label: '2 horas antes' },
  { value: '1h', label: '1 hora antes' },
];

export const useEmailRemindersSection = () => {
  const [previewModal, setPreviewModal] = useState({ isOpen: false });

  const form = useFormContext<TEmailSettingsFormData>();
  const customMessage = form.watch('emailReminderCustomMessage') || '';

  const openPreview = useCallback(() => {
    setPreviewModal({ isOpen: true });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewModal({ isOpen: false });
  }, []);

  return {
    form,
    customMessage,
    timingOptions: TIMING_OPTIONS,
    previewModal,
    openPreview,
    closePreview,
  };
};
