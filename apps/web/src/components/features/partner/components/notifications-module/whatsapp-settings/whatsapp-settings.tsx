'use client';

import Link from 'next/link';
import { FormProvider } from 'react-hook-form';
import { PARTNER_FOCUS_CLASS } from '../../../partner.styles';
import { ReminderChannelLayout } from '../components/reminder-channel-card';
import { WhatsappRemindersSection } from './whatsapp-reminders-section';
import { useWhatsappSettings } from './whatsapp-settings.hook';

export const WhatsappSettings = () => {
  const {
    form,
    isUpdatingNotificationsSettings,
    handleSubmit,
    showActivationNotice,
    loadState,
    handleRetry,
    isRetrying,
  } = useWhatsappSettings();

  return (
    <ReminderChannelLayout
      title="Configurações de WhatsApp"
      description="Configure lembretes automáticos por WhatsApp para seus clientes"
      loadState={loadState}
      onRetry={handleRetry}
      isRetrying={isRetrying}
    >
      {showActivationNotice ? (
        <p className="rounded-[14px] bg-[#FFF1E0] px-[18px] py-3.5 text-sm leading-normal text-[#6E3B00]">
          <strong>Ativação do WhatsApp Business API necessária.</strong> Para
          usar lembretes por WhatsApp, ative a integração primeiro.{' '}
          <Link
            href="/partner/settings/whatsapp"
            className={`font-bold underline ${PARTNER_FOCUS_CLASS}`}
          >
            Configurar WhatsApp Business
          </Link>
        </p>
      ) : null}

      <FormProvider {...form}>
        <WhatsappRemindersSection
          isSaving={isUpdatingNotificationsSettings}
          onSubmit={handleSubmit}
        />
      </FormProvider>
    </ReminderChannelLayout>
  );
};
