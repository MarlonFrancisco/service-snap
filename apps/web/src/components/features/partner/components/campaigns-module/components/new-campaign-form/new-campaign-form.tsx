'use client';

import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Textarea,
} from '@repo/ui';
import { Eye, Info, Lock, Plus, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { FormProvider } from 'react-hook-form';
import { RetentionSegmented } from '../../../packages-module/components/retention-segmented';
import {
  RETENTION_ALERT_CLASS,
  RETENTION_BUTTON_CLASS,
  RETENTION_BUTTON_ICON_CLASS,
  RETENTION_CARD_CLASS,
  RETENTION_CARD_TITLE_CLASS,
  RETENTION_DIALOG_CLASS,
  RETENTION_DIALOG_TITLE_CLASS,
  RETENTION_FIELD_CLASS,
  RETENTION_HINT_CLASS,
  RETENTION_LABEL_CLASS,
  RETENTION_NOTE_CLASS,
  RETENTION_NOTE_ICON_CLASS,
  RETENTION_PRIMARY_BUTTON_CLASS,
  RETENTION_SELECT_CLASS,
  RETENTION_SMALL_BUTTON_CLASS,
  RETENTION_TEXTAREA_CLASS,
} from '../../../packages-module/packages-module.styles';
import {
  MAX_EMAIL_MESSAGE,
  TEMPLATE_VARIABLE_SOURCES,
} from '../../campaigns-module.helpers';
import { CampaignEmailPreview } from './campaign-email-preview';
import { useNewCampaignForm } from './new-campaign-form.hook';
import type { TNewCampaignFormConfig } from './new-campaign-form.types';

const LOCK_NOTE_CLASS = cn(RETENTION_NOTE_CLASS, 'bg-[#F2F0FB] text-[#3B2A6B]');

export const NewCampaignForm = (config: TNewCampaignFormConfig) => {
  const {
    form,
    usesWhatsapp,
    usesEmail,
    whatsappState,
    whatsappPlanName,
    isRetryingTemplates,
    handleRetryTemplates,
    templateOptions,
    templatePreviewName,
    previewParams,
    variableFields,
    variableSources,
    canAddVariable,
    handleAddVariable,
    handleRemoveVariable,
    messageCount,
    isEmailPreviewOpen,
    setIsEmailPreviewOpen,
    emailPreview,
    sendLabel,
    canSend,
    isSending,
    submitError,
    handleSubmit,
  } = useNewCampaignForm(config);

  const renderWhatsappNotice = () => {
    if (whatsappState === 'no-plan') {
      return (
        <div className={LOCK_NOTE_CLASS}>
          <Lock aria-hidden="true" className={RETENTION_NOTE_ICON_CLASS} />
          <p className="m-0">
            Campanha por WhatsApp está no plano <b>{whatsappPlanName}</b>. O
            e-mail já está liberado.{' '}
            <Link href="/partner/plans/upgrade" className="font-bold underline">
              Fazer upgrade
            </Link>
          </p>
        </div>
      );
    }
    if (whatsappState === 'loading') {
      return (
        <p className={cn('text-[13px]', RETENTION_HINT_CLASS)}>
          Carregando templates da Meta...
        </p>
      );
    }
    if (whatsappState === 'not-connected') {
      return (
        <div role="alert" className={RETENTION_NOTE_CLASS}>
          <Info aria-hidden="true" className={RETENTION_NOTE_ICON_CLASS} />
          <div className="grid gap-2">
            <p className="m-0">
              Não foi possível ler os templates. Confira se o WhatsApp da loja
              está conectado.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/partner/settings/whatsapp"
                className={cn(
                  RETENTION_BUTTON_CLASS,
                  RETENTION_SMALL_BUTTON_CLASS,
                )}
              >
                Ver WhatsApp
              </Link>
              <button
                type="button"
                onClick={handleRetryTemplates}
                disabled={isRetryingTemplates}
                className={cn(
                  RETENTION_BUTTON_CLASS,
                  RETENTION_SMALL_BUTTON_CLASS,
                )}
              >
                {isRetryingTemplates ? 'Tentando...' : 'Tentar de novo'}
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (whatsappState === 'no-template') {
      return (
        <div className={RETENTION_NOTE_CLASS}>
          <Info aria-hidden="true" className={RETENTION_NOTE_ICON_CLASS} />
          <p className="m-0">
            Nenhum template de <b>marketing</b> aprovado pela Meta na sua conta.
            Crie um no WhatsApp Manager e espere a aprovação.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby="new-campaign-title"
        className={RETENTION_CARD_CLASS}
      >
        <h2 id="new-campaign-title" className={RETENTION_CARD_TITLE_CLASS}>
          Nova campanha
        </h2>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={RETENTION_LABEL_CLASS}>
                Nome interno
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex.: Sentimos sua falta"
                  autoComplete="off"
                  className={RETENTION_FIELD_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <RetentionSegmented
          name="campaign-channel"
          label="Canal"
          options={config.channelOptions}
          value={config.audience.channel}
          onChange={config.onChannelChange}
        />

        {usesWhatsapp ? (
          <>
            {renderWhatsappNotice()}
            {whatsappState === 'ready' ? (
              <>
                <FormField
                  control={form.control}
                  name="templateKey"
                  render={({ field }) => (
                    <FormItem className="gap-1.5">
                      <FormLabel className={RETENTION_LABEL_CLASS}>
                        Template de marketing
                        <span className={RETENTION_HINT_CLASS}>
                          Só aparecem os aprovados pela Meta na sua conta
                        </span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className={RETENTION_SELECT_CLASS}>
                            <SelectValue placeholder="Escolha o template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={PARTNER_PORTAL_CLASS}>
                          {templateOptions.map((option) => (
                            <SelectItem key={option.key} value={option.key}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <fieldset className="m-0 grid min-w-0 gap-3 border-0 p-0">
                  <legend className="sr-only">Variáveis do template</legend>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    {variableFields.map((variable, index) => (
                      <div
                        key={variable.id}
                        className="grid content-start gap-2"
                      >
                        <FormField
                          control={form.control}
                          name={`variables.${index}.source`}
                          render={({ field }) => (
                            <FormItem className="gap-1.5">
                              <FormLabel className={RETENTION_LABEL_CLASS}>
                                Variável {index + 1} do template
                              </FormLabel>
                              <div className="flex gap-2">
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger
                                      className={cn(
                                        RETENTION_SELECT_CLASS,
                                        'min-w-0',
                                      )}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent
                                    className={PARTNER_PORTAL_CLASS}
                                  >
                                    {TEMPLATE_VARIABLE_SOURCES.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariable(index)}
                                  aria-label={`Tirar a variável ${index + 1}`}
                                  className={cn(
                                    RETENTION_BUTTON_CLASS,
                                    'size-[46px] shrink-0 px-0',
                                  )}
                                >
                                  <Trash2
                                    aria-hidden="true"
                                    className={RETENTION_BUTTON_ICON_CLASS}
                                  />
                                </button>
                              </div>
                            </FormItem>
                          )}
                        />
                        {variableSources[index] === 'text' ? (
                          <FormField
                            control={form.control}
                            name={`variables.${index}.text`}
                            render={({ field }) => (
                              <FormItem className="gap-1.5">
                                <FormLabel className="sr-only">
                                  Texto da variável {index + 1}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    maxLength={200}
                                    placeholder="Ex.: 10% de desconto"
                                    autoComplete="off"
                                    className={RETENTION_FIELD_CLASS}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariable}
                    disabled={!canAddVariable}
                    className={cn(
                      RETENTION_BUTTON_CLASS,
                      RETENTION_SMALL_BUTTON_CLASS,
                      'justify-self-start',
                    )}
                  >
                    <Plus
                      aria-hidden="true"
                      className={RETENTION_BUTTON_ICON_CLASS}
                    />
                    Adicionar variável
                  </button>
                </fieldset>

                <figure className="m-0 rounded-[18px] bg-[#E7DDD3] p-4">
                  <figcaption className="sr-only">
                    Prévia no WhatsApp
                  </figcaption>
                  <div className="max-w-[340px] rounded-[4px_14px_14px_14px] bg-white px-3.5 py-3 text-sm leading-[1.45]">
                    <p className="m-0">
                      Texto aprovado do template
                      {templatePreviewName ? (
                        <>
                          {' '}
                          <b className="font-mono text-[13px]">
                            {templatePreviewName}
                          </b>
                        </>
                      ) : null}
                      {previewParams.length ? ', com:' : '.'}
                    </p>
                    {previewParams.length ? (
                      <ul className="m-0 mt-1 list-none p-0">
                        {previewParams.map((param) => (
                          <li key={param.position}>
                            <span className="font-mono text-[13px] text-[#6F6C7E]">
                              {`{{${param.position}}}`}
                            </span>{' '}
                            {param.value}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <span className="mt-1.5 block text-right text-[11px] text-[#6F6C7E]">
                      Prévia
                    </span>
                  </div>
                </figure>
              </>
            ) : null}
          </>
        ) : null}

        {usesEmail ? (
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="gap-1.5">
                  <FormLabel className={RETENTION_LABEL_CLASS}>
                    Texto do e-mail
                    <span className={RETENTION_HINT_CLASS}>
                      Vai no modelo de e-mail do ServiceSnap, com o link para
                      sair da lista
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      maxLength={MAX_EMAIL_MESSAGE}
                      placeholder="Ex.: Faz tempo que você não vem. Que tal marcar um horário esta semana?"
                      aria-describedby="campaign-message-count"
                      className={RETENTION_TEXTAREA_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                id="campaign-message-count"
                className={cn('text-[13px]', RETENTION_HINT_CLASS)}
              >
                {messageCount} caracteres
              </span>
              <button
                type="button"
                onClick={() => setIsEmailPreviewOpen(true)}
                className={cn(
                  RETENTION_BUTTON_CLASS,
                  RETENTION_SMALL_BUTTON_CLASS,
                )}
              >
                <Eye
                  aria-hidden="true"
                  className={RETENTION_BUTTON_ICON_CLASS}
                />
                Ver prévia do e-mail
              </button>
            </div>
          </div>
        ) : null}

        <div className={RETENTION_NOTE_CLASS}>
          <Info aria-hidden="true" className={RETENTION_NOTE_ICON_CLASS} />
          <p className="m-0">
            As mensagens saem aos poucos, em segundo plano, e você acompanha
            aqui. Quem pedir para não receber mais é marcado na ficha e fica
            fora das próximas.
          </p>
        </div>

        {submitError ? (
          <p role="alert" className={RETENTION_ALERT_CLASS}>
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSend || isSending}
          className={RETENTION_PRIMARY_BUTTON_CLASS}
        >
          {isSending ? (
            <>
              <Spinner />
              Enviando...
            </>
          ) : (
            <>
              <Send
                aria-hidden="true"
                className={RETENTION_BUTTON_ICON_CLASS}
              />
              {sendLabel}
            </>
          )}
        </button>
      </form>

      <Dialog open={isEmailPreviewOpen} onOpenChange={setIsEmailPreviewOpen}>
        <DialogContent
          className={cn(RETENTION_DIALOG_CLASS, 'sm:max-w-[680px]')}
        >
          <DialogHeader className="text-left">
            <DialogTitle className={RETENTION_DIALOG_TITLE_CLASS}>
              Prévia do e-mail
            </DialogTitle>
            <DialogDescription className="text-sm text-[#5F5C6E]">
              Como o primeiro cliente marcado vai receber.
            </DialogDescription>
          </DialogHeader>
          <CampaignEmailPreview {...emailPreview} />
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
};
