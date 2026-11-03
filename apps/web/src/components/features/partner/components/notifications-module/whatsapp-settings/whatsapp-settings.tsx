'use client';

import { Plug } from 'lucide-react';
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
    lockedHint,
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
        <section
          aria-labelledby="whatsapp-connect-title"
          className="flex flex-wrap items-center gap-5 rounded-[24px] bg-[#FFF1E0] p-6 text-[#6E3B00]"
        >
          <span
            aria-hidden="true"
            className="grid size-[52px] flex-none place-items-center rounded-full bg-white"
          >
            <Plug className="size-6 stroke-[1.8]" />
          </span>
          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1.5">
            <h2
              id="whatsapp-connect-title"
              className="text-[17px] font-extrabold text-[#4A2700]"
            >
              Conecte o WhatsApp da sua loja para liberar os lembretes
            </h2>
            <p className="text-sm leading-[1.55]">
              Os lembretes saem do número da sua loja pela API oficial do
              WhatsApp Business. Até você concluir a integração, esta
              configuração fica bloqueada.
            </p>
            <ol className="mt-1.5 flex list-decimal flex-col gap-1 pl-5 text-sm font-semibold">
              <li>Abra Integrações › WhatsApp</li>
              <li>Informe os dados da sua conta WhatsApp Business</li>
              <li>Volte aqui e ative os lembretes</li>
            </ol>
          </div>
          <Link
            href="/partner/settings/whatsapp"
            className={`inline-flex min-h-12 items-center justify-center rounded-full bg-[#0B0B0F] px-[22px] text-sm font-bold text-white transition-colors hover:bg-[#2B2B2B] ${PARTNER_FOCUS_CLASS}`}
          >
            Conectar WhatsApp
          </Link>
        </section>
      ) : null}

      <FormProvider {...form}>
        <WhatsappRemindersSection
          isSaving={isUpdatingNotificationsSettings}
          onSubmit={handleSubmit}
          lockedHint={lockedHint}
        />
      </FormProvider>
    </ReminderChannelLayout>
  );
};
