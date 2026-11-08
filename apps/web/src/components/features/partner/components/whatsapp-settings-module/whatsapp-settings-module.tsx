'use client';

import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Spinner,
  Switch,
} from '@repo/ui';
import Link from 'next/link';
import { FormProvider } from 'react-hook-form';
import {
  ModuleErrorState,
  NoStoreState,
} from '../notifications-module/components/module-state';
import {
  MODULE_ACTION_CLASS,
  MODULE_BADGE_CLASS,
  MODULE_CARD_CLASS,
  MODULE_CARD_TITLE_CLASS,
  MODULE_FIELD_CLASS,
  MODULE_FIELD_LABEL_CLASS,
  MODULE_LEAD_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
} from '../notifications-module/notifications-module.styles';
import {
  getGuideStepHref,
  WHATSAPP_GUIDE_ROUTE,
} from './whatsapp-connect-guide';
import { WhatsappConnectEmpty } from './whatsapp-connect-empty';
import { WhatsappConnectionChecks } from './whatsapp-connection-checks';
import { WhatsappSettingsModuleSkeleton } from './whatsapp-settings-module-skeleton';
import { useWhatsappSettingsModule } from './whatsapp-settings-module.hook';

const CARD_NOTE_CLASS = 'text-sm leading-normal text-[#5F5C6E]';
const LARGE_ACTION_CLASS = 'min-h-12 px-[18px]';

const CREDENTIAL_FIELDS = [
  { name: 'phoneNumberId', label: 'Phone Number ID *' },
  { name: 'businessAccountId', label: 'Business Account ID *' },
] as const;

export const WhatsappSettingsModule = () => {
  const {
    isLoading,
    isError,
    hasNoStore,
    isConfigured,
    handleRetry,
    isRetrying,
    isSaveConfigPending,
    form,
    handleSubmit,
    whatsappStatus,
    isConnected,
    connectionIssues,
    handleUseSuggestion,
    hasUnsavedCredentials,
    statusBadge,
    isCheckingStatus,
    isWhatsappStatusError,
    isWhatsappStatusFetching,
    refetchWhatsappStatus,
    whatsappTemplates,
    isLoadingTemplates,
    isWhatsappTemplatesError,
    templatesErrorMessage,
    isWhatsappTemplatesFetching,
    refetchWhatsappTemplates,
    testPhone,
    setTestPhone,
    handleSendTest,
    isSendTestPending,
    webhookTokenLabel,
    hasWebhookToken,
    handleCopyWebhookToken,
  } = useWhatsappSettingsModule();

  if (hasNoStore) return <NoStoreState />;
  if (isLoading) return <WhatsappSettingsModuleSkeleton />;
  if (isError) {
    return <ModuleErrorState onRetry={handleRetry} isRetrying={isRetrying} />;
  }
  if (!isConfigured) return <WhatsappConnectEmpty />;

  return (
    <div className="grid gap-4 min-[1280px]:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] min-[1280px]:items-start">
      <div className="flex flex-wrap items-center justify-between gap-3 min-[1280px]:col-span-full">
        <div className="min-w-0 max-w-[620px]">
          <h2 className="sr-only">WhatsApp</h2>
          <p className={MODULE_LEAD_CLASS}>
            Veja o status da conexão, teste o envio, confira templates e o
            histórico, sem precisar abrir o painel da Meta a cada passo.
          </p>
        </div>
        <Link
          href="/partner/notifications/history"
          className={cn(MODULE_ACTION_CLASS, LARGE_ACTION_CLASS)}
        >
          Ver histórico de envios
        </Link>
      </div>

      {/* Desktop largo: status, teste e templates à esquerda; credenciais à direita. */}
      <div className="grid min-w-0 content-start gap-4 min-[1680px]:grid-cols-2">
        <section
          className={cn(MODULE_CARD_CLASS, 'min-[1680px]:col-span-full')}
        >
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <h3 className={MODULE_CARD_TITLE_CLASS}>Status da conexão</h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={cn(MODULE_BADGE_CLASS, statusBadge.className)}>
                {statusBadge.label}
              </span>
              <button
                type="button"
                onClick={() => void refetchWhatsappStatus()}
                disabled={isWhatsappStatusFetching}
                className={MODULE_ACTION_CLASS}
              >
                {isWhatsappStatusFetching ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </div>

          {isConnected ? (
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] gap-3 text-sm">
              <div>
                <dt className="text-xs text-[#5F5C6E]">Nome verificado</dt>
                <dd className="mt-0.5 font-semibold">
                  {whatsappStatus?.verifiedName || 'Não informado'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#5F5C6E]">Número</dt>
                <dd className="mt-0.5 font-semibold">
                  {whatsappStatus?.displayPhoneNumber || 'Não informado'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#5F5C6E]">Qualidade</dt>
                <dd className="mt-0.5 font-semibold">
                  {whatsappStatus?.qualityRating || 'Não informada'}
                </dd>
              </div>
            </dl>
          ) : connectionIssues.length ? null : (
            <p role="status" className={CARD_NOTE_CLASS}>
              {isCheckingStatus
                ? 'Validando as credenciais com a Cloud API da Meta...'
                : isWhatsappStatusError
                  ? 'Não foi possível verificar a conexão agora. Suas credenciais não foram alteradas.'
                  : whatsappStatus?.message ||
                    'Complete e salve as credenciais abaixo, depois atualize o status.'}
            </p>
          )}

          {hasUnsavedCredentials ? (
            <p
              role="status"
              className="rounded-[14px] bg-[#FFF4E5] px-3.5 py-3 text-sm leading-normal text-[#6B3A00]"
            >
              Você alterou as credenciais abaixo. Salve as alterações para
              conferir os novos dados: o status mostra o que está salvo.
            </p>
          ) : null}

          {connectionIssues.length ? (
            <WhatsappConnectionChecks
              checks={connectionIssues}
              onUseSuggestion={handleUseSuggestion}
              isApplyingSuggestion={isSaveConfigPending}
              renderReview={(step) => (
                <Link
                  href={getGuideStepHref(step)}
                  className={MODULE_ACTION_CLASS}
                >
                  Rever o passo {step}
                </Link>
              )}
            />
          ) : null}
        </section>

        <section className={MODULE_CARD_CLASS}>
          <h3 className={MODULE_CARD_TITLE_CLASS}>Teste de envio</h3>
          <p className={CARD_NOTE_CLASS}>
            O número precisa ter falado com a loja nas últimas 24 horas,
            conforme a janela de atendimento da Meta.
          </p>
          <form
            onSubmit={handleSendTest}
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <label
              className={cn('grid flex-1 gap-1.5', MODULE_FIELD_LABEL_CLASS)}
            >
              Número de destino
              <Input
                inputMode="tel"
                value={testPhone}
                onChange={(event) => setTestPhone(event.target.value)}
                placeholder="5511999999999"
                className={MODULE_FIELD_CLASS}
              />
            </label>
            <button
              type="submit"
              disabled={isSendTestPending || !testPhone.trim()}
              className={cn(MODULE_PRIMARY_ACTION_CLASS, LARGE_ACTION_CLASS)}
            >
              {isSendTestPending ? (
                <>
                  <Spinner />
                  Enviando...
                </>
              ) : (
                'Enviar teste'
              )}
            </button>
          </form>
        </section>

        <section className={MODULE_CARD_CLASS}>
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <h3 className={MODULE_CARD_TITLE_CLASS}>Templates (Meta)</h3>
            {isConnected ? (
              <button
                type="button"
                onClick={() => void refetchWhatsappTemplates()}
                disabled={isWhatsappTemplatesFetching}
                className={MODULE_ACTION_CLASS}
              >
                {isWhatsappTemplatesFetching ? 'Atualizando...' : 'Atualizar'}
              </button>
            ) : null}
          </div>

          {!isConnected ? (
            <p className={CARD_NOTE_CLASS}>
              Conecte o WhatsApp para carregar os templates.
            </p>
          ) : isLoadingTemplates ? (
            <p role="status" className={CARD_NOTE_CLASS}>
              Carregando templates...
            </p>
          ) : isWhatsappTemplatesError ? (
            <p role="alert" className="text-sm leading-normal text-[#A4231A]">
              {templatesErrorMessage}
            </p>
          ) : whatsappTemplates?.length ? (
            <ul>
              {whatsappTemplates.map((template) => (
                <li
                  key={`${template.name}-${template.language}`}
                  className="flex justify-between gap-3 border-t border-[#F0EEF4] py-2.5 text-sm"
                >
                  <div className="min-w-0 break-words">
                    {template.name}
                    <span className="block text-[13px] text-[#5F5C6E]">
                      {template.language}
                      {template.category ? ` · ${template.category}` : ''}
                    </span>
                  </div>
                  <strong className="shrink-0">{template.status}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className={CARD_NOTE_CLASS}>
              Nenhum template encontrado nesta conta.
            </p>
          )}
        </section>
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className={MODULE_CARD_CLASS}>
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <h3 className={MODULE_CARD_TITLE_CLASS}>
              Credenciais da API (Meta)
            </h3>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Ativar WhatsApp"
                  />
                  Ativar WhatsApp
                </label>
              )}
            />
          </div>

          <p className={CARD_NOTE_CLASS}>
            Não sabe onde encontrar esses dados?{' '}
            <Link
              href={WHATSAPP_GUIDE_ROUTE}
              className="font-bold text-[#0B0B0F] underline underline-offset-[3px]"
            >
              Ver o passo a passo na Meta
            </Link>
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3">
            {CREDENTIAL_FIELDS.map(({ name, label }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={MODULE_FIELD_LABEL_CLASS}>
                      {label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        aria-required="true"
                        className={MODULE_FIELD_CLASS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <FormField
            control={form.control}
            name="accessToken"
            render={({ field }) => (
              <FormItem className="gap-1.5">
                <FormLabel className={MODULE_FIELD_LABEL_CLASS}>
                  Access Token *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    autoComplete="off"
                    aria-required="true"
                    className={MODULE_FIELD_CLASS}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label
              className={cn('grid flex-1 gap-1.5', MODULE_FIELD_LABEL_CLASS)}
            >
              Webhook Verify Token
              <Input
                readOnly
                value={webhookTokenLabel}
                className={cn(MODULE_FIELD_CLASS, 'text-[#5F5C6E]')}
              />
            </label>
            <button
              type="button"
              onClick={() => void handleCopyWebhookToken()}
              disabled={!hasWebhookToken}
              aria-label="Copiar Webhook Verify Token"
              className={cn(MODULE_ACTION_CLASS, LARGE_ACTION_CLASS)}
            >
              Copiar
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaveConfigPending}
              className={cn(MODULE_PRIMARY_ACTION_CLASS, LARGE_ACTION_CLASS)}
            >
              {isSaveConfigPending ? (
                <>
                  <Spinner />
                  Salvando...
                </>
              ) : (
                'Salvar alterações'
              )}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
