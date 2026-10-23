import { useWhatsappMutation } from '@/hooks/partner';
import { useWhatsappQuery } from '@/hooks/use-query/use-whatsapp-query';
import { usePartnerStore } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  IWhatsappSettingsSchema,
  whatsappSettingsSchema,
} from './whatsapp-settings.schema';

export const useWhatsappSettingsModule = () => {
  const { saveConfig, isSaveConfigPending, sendTest, isSendTestPending } =
    useWhatsappMutation();
  const { activeStore } = usePartnerStore();
  const {
    whatsappConfig,
    isWhatsappPending,
    whatsappStatus,
    isWhatsappStatusPending,
    refetchWhatsappStatus,
    whatsappTemplates,
    isWhatsappTemplatesPending,
    isWhatsappTemplatesError,
    whatsappTemplatesError,
    refetchWhatsappTemplates,
  } = useWhatsappQuery(activeStore.id);

  const [testPhone, setTestPhone] = useState('');

  const form = useForm<IWhatsappSettingsSchema>({
    resolver: zodResolver(whatsappSettingsSchema),
    defaultValues: {
      isActive: false,
      phoneNumberId: '',
      businessAccountId: '',
      accessToken: '',
      webhookVerifyToken: '',
    },
  });

  useEffect(() => {
    if (whatsappConfig) {
      form.setValue('isActive', whatsappConfig.isActive ?? false);
      form.setValue('phoneNumberId', whatsappConfig.phoneNumberId || '');
      form.setValue(
        'businessAccountId',
        whatsappConfig.businessAccountId || '',
      );
      form.setValue('accessToken', whatsappConfig.accessToken || '');
      form.setValue(
        'webhookVerifyToken',
        whatsappConfig.webhookVerifyToken || '',
      );
    }
  }, [whatsappConfig, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    saveConfig({
      ...data,
      id: whatsappConfig?.id,
      store: { id: activeStore.id },
    });
  });

  const handleSendTest = () => {
    if (!testPhone.trim()) return;
    sendTest({
      storeId: activeStore.id,
      payload: { to: testPhone.trim() },
    });
  };

  return {
    isSaveConfigPending,
    isWhatsappPending,
    form,
    handleSubmit,
    whatsappStatus,
    isWhatsappStatusPending,
    refetchWhatsappStatus,
    whatsappTemplates,
    isWhatsappTemplatesPending,
    isWhatsappTemplatesError,
    whatsappTemplatesError,
    refetchWhatsappTemplates,
    testPhone,
    setTestPhone,
    handleSendTest,
    isSendTestPending,
  };
};
