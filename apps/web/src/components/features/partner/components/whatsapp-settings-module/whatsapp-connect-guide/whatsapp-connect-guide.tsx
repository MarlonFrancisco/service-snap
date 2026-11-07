'use client';

import { cn } from '@repo/ui';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { FormProvider } from 'react-hook-form';
import {
  ModuleErrorState,
  NoStoreState,
} from '../../notifications-module/components/module-state';
import {
  MODULE_ACTION_CLASS,
  MODULE_CARD_CLASS,
  MODULE_LEAD_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
  MODULE_TITLE_CLASS,
} from '../../notifications-module/notifications-module.styles';
import { PARTNER_FOCUS_CLASS } from '../../../partner.styles';
import { WhatsappConnectSuccess } from '../whatsapp-connect-success';
import { WhatsappSettingsModuleSkeleton } from '../whatsapp-settings-module-skeleton';
import {
  GuideCreateAppStep,
  GuideIdsStep,
  GuideIntroStep,
  GuidePhoneStep,
  GuideTokenStep,
  GuideVerifyStep,
  GuideWebhookStep,
} from './components/guide-steps';
import { WHATSAPP_SETTINGS_ROUTE } from './whatsapp-connect-guide.constants';
import { useWhatsappConnectGuide } from './whatsapp-connect-guide.hook';
import type { IWhatsappConnectGuideProps } from './whatsapp-connect-guide.types';

const LARGE_ACTION_CLASS = 'min-h-12 px-[18px]';

export const WhatsappConnectGuide = ({
  initialStep,
}: IWhatsappConnectGuideProps) => {
  const {
    hasNoStore,
    isLoading,
    isError,
    handleRetry,
    isRetrying,
    form,
    step,
    steps,
    lastStep,
    progress,
    goToStep,
    handleNext,
    handlePrev,
    handleVerify,
    isVerifying,
    hasResult,
    isConnected,
    checks,
    handleUseSuggestion,
    whatsappStatus,
    storeId,
    webhookUrl,
    webhookTokenLabel,
    hasWebhookToken,
    handleCopyWebhookUrl,
    handleCopyWebhookToken,
  } = useWhatsappConnectGuide(initialStep);

  if (hasNoStore) return <NoStoreState />;
  if (isLoading) return <WhatsappSettingsModuleSkeleton />;
  if (isError) {
    return <ModuleErrorState onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  if (isConnected && whatsappStatus) {
    return <WhatsappConnectSuccess status={whatsappStatus} storeId={storeId} />;
  }

  const current = steps[step] ?? steps[0];

  return (
    <div className="grid max-w-[1120px] gap-6">
      <div>
        <h2 className={MODULE_TITLE_CLASS}>
          Como conseguir as credenciais da API do WhatsApp
        </h2>
        <p className={cn(MODULE_LEAD_CLASS, 'max-w-[680px]')}>
          Siga os passos na Meta e cole cada dado aqui assim que aparecer. Leva
          cerca de 15 minutos. Nada é salvo até você verificar a conexão no
          último passo.
        </p>
        <div
          role="progressbar"
          aria-label="Progresso da configuração"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#F0EEF4]"
        >
          <div
            className="h-full rounded-full bg-[#9810FA] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <ol
          aria-label="Etapas"
          className="hidden w-[280px] shrink-0 gap-1 lg:grid"
        >
          {steps.map(({ title, hint }, index) => {
            const isCurrent = index === step;
            const isDone = index < step;
            return (
              <li key={title}>
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'flex min-h-[52px] w-full cursor-pointer items-center gap-3 rounded-[16px] px-3 py-2 text-left text-sm font-semibold transition-colors',
                    isCurrent
                      ? 'bg-[#F4F3F7] text-[#0B0B0F]'
                      : 'text-[#5F5C6E] hover:bg-[#F7F6FA]',
                    PARTNER_FOCUS_CLASS,
                  )}
                >
                  <span
                    className={cn(
                      'grid size-[30px] shrink-0 place-items-center rounded-full border-[1.5px] text-[13px] font-bold',
                      isCurrent
                        ? 'border-[#0B0B0F] bg-[#0B0B0F] text-white'
                        : isDone
                          ? 'border-[#0A5536] bg-[#DFF2E7] text-[#0A5536]'
                          : 'border-[#D8D5E0]',
                    )}
                  >
                    {isDone ? (
                      <Check aria-label="Concluída" className="size-4" />
                    ) : (
                      index
                    )}
                  </span>
                  <span>
                    {title}
                    <small className="block text-xs font-medium text-[#6F6C7E]">
                      {hint}
                    </small>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <p className="text-sm font-semibold text-[#5F5C6E] lg:hidden">
          {step === 0 ? current.title : `Passo ${step} de ${lastStep}`}
          <span className="sr-only"> · {current.hint}</span>
        </p>

        <div className="grid min-w-0 flex-1 gap-4">
          <FormProvider {...form}>
            <section
              aria-label={current.title}
              className={cn(MODULE_CARD_CLASS, 'gap-4 p-6')}
            >
              {step === 0 ? <GuideIntroStep /> : null}
              {step === 1 ? <GuideCreateAppStep /> : null}
              {step === 2 ? <GuidePhoneStep /> : null}
              {step === 3 ? <GuideIdsStep /> : null}
              {step === 4 ? <GuideTokenStep /> : null}
              {step === 5 ? (
                <GuideWebhookStep
                  webhookUrl={webhookUrl}
                  webhookTokenLabel={webhookTokenLabel}
                  hasWebhookToken={hasWebhookToken}
                  onCopyUrl={handleCopyWebhookUrl}
                  onCopyToken={handleCopyWebhookToken}
                />
              ) : null}
              {step === 6 ? (
                <GuideVerifyStep
                  onVerify={() => void handleVerify()}
                  isVerifying={isVerifying}
                  hasResult={hasResult}
                  checks={checks}
                  onReviewStep={goToStep}
                  onUseSuggestion={handleUseSuggestion}
                />
              ) : null}
            </section>
          </FormProvider>

          <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[#EBE9F0] bg-white/95 py-3 lg:static lg:border-0 lg:bg-transparent lg:py-0">
            <Link
              href={WHATSAPP_SETTINGS_ROUTE}
              className="text-[13px] font-semibold underline underline-offset-[3px]"
            >
              Fazer depois
            </Link>
            <div className="flex gap-2">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className={cn(MODULE_ACTION_CLASS, LARGE_ACTION_CLASS)}
                >
                  Voltar
                </button>
              ) : null}
              {step < lastStep ? (
                <button
                  type="button"
                  onClick={() => void handleNext()}
                  className={cn(
                    MODULE_PRIMARY_ACTION_CLASS,
                    LARGE_ACTION_CLASS,
                  )}
                >
                  {step === 0 ? 'Começar' : 'Continuar'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
