'use client';

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
  Spinner,
  Switch,
} from '@repo/ui';
import { FormProvider } from 'react-hook-form';
import {
  PANEL_BUTTON_CLASS,
  PANEL_DIALOG_CLASS,
  PANEL_DIALOG_TITLE_CLASS,
  PANEL_ERROR_CLASS,
  PANEL_FIELD_CLASS,
  PANEL_FIELD_HINT_CLASS,
  PANEL_FIELD_LABEL_CLASS,
  PANEL_PRIMARY_BUTTON_CLASS,
  PANEL_TEXT_CLASS,
} from '../../../../audit-logs-module/audit-logs-module.styles';
import { WEBHOOK_EVENT_OPTIONS } from '../../../integrations-module.helpers';
import { useWebhookDialog } from './webhook-dialog.hook';
import type { TWebhookDialogConfig } from './webhook-dialog.types';

export const WebhookDialog = (config: TWebhookDialogConfig) => {
  const {
    form,
    isEditing,
    submitError,
    isSubmitting,
    handleOpenChange,
    handleSubmit,
    toggleEvent,
  } = useWebhookDialog(config);

  const title = isEditing ? 'Editar webhook' : 'Novo webhook';

  return (
    <Dialog open={config.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={PANEL_DIALOG_CLASS}>
        <DialogHeader className="text-left">
          <DialogTitle className={PANEL_DIALOG_TITLE_CLASS}>
            {title}
          </DialogTitle>
          <DialogDescription className={PANEL_TEXT_CLASS}>
            Avisamos este endereço quando um agendamento é criado, alterado ou
            cancelado.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            noValidate
            onSubmit={handleSubmit}
            aria-label={title}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={PANEL_FIELD_LABEL_CLASS}>
                    Endereço
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      inputMode="url"
                      placeholder="https://seu-sistema.com.br/servicesnap"
                      autoComplete="off"
                      className={PANEL_FIELD_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={PANEL_FIELD_LABEL_CLASS}>
                    <span>
                      Descrição{' '}
                      <span className={PANEL_FIELD_HINT_CLASS}>(opcional)</span>
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: Sistema de gestão"
                      autoComplete="off"
                      maxLength={120}
                      className={PANEL_FIELD_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="events"
              render={({ field }) => (
                <FormItem>
                  <fieldset className="grid gap-1">
                    <legend className="mb-1 text-[13px] font-bold">
                      Eventos
                    </legend>
                    {WEBHOOK_EVENT_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex min-h-11 cursor-pointer items-start gap-2.5 text-sm leading-[1.45]"
                      >
                        <input
                          type="checkbox"
                          checked={field.value.includes(option.value)}
                          onChange={(event) =>
                            field.onChange(
                              toggleEvent(
                                field.value,
                                option.value,
                                event.target.checked,
                              ),
                            )
                          }
                          className="mt-0.5 size-5 shrink-0 accent-[#9810FA]"
                        />
                        <span>
                          <b>{option.label}</b>{' '}
                          <code className="text-[13px] text-[#5F5C6E]">
                            {option.value}
                          </code>
                          <span className="block text-[13px] text-[#5F5C6E]">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing ? (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 rounded-2xl border border-[#EBE9F0] px-4 py-3">
                    <span className="grid gap-0.5">
                      <FormLabel className="text-sm font-bold">Ativo</FormLabel>
                      <span className="text-[13px] text-[#5F5C6E]">
                        Desligado, o endereço não recebe eventos. Religar zera a
                        contagem de falhas.
                      </span>
                    </span>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#9810FA]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ) : null}

            {submitError ? (
              <p role="alert" className={PANEL_ERROR_CLASS}>
                {submitError}
              </p>
            ) : null}

            <div className="mt-1 flex gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className={cn(PANEL_BUTTON_CLASS, 'flex-1')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(PANEL_PRIMARY_BUTTON_CLASS, 'flex-1')}
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Salvando...
                  </>
                ) : isEditing ? (
                  'Salvar'
                ) : (
                  'Criar webhook'
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
