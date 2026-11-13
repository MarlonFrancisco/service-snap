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
} from '@repo/ui';
import { FormProvider } from 'react-hook-form';
import {
  PANEL_BUTTON_CLASS,
  PANEL_DIALOG_CLASS,
  PANEL_DIALOG_TITLE_CLASS,
  PANEL_ERROR_CLASS,
  PANEL_FIELD_CLASS,
  PANEL_FIELD_LABEL_CLASS,
  PANEL_PRIMARY_BUTTON_CLASS,
  PANEL_TEXT_CLASS,
} from '../../../../audit-logs-module/audit-logs-module.styles';
import { useNewApiKeyDialog } from './new-api-key-dialog.hook';
import type { TNewApiKeyDialogConfig } from './new-api-key-dialog.types';

export const NewApiKeyDialog = (config: TNewApiKeyDialogConfig) => {
  const { form, submitError, isSubmitting, handleOpenChange, handleSubmit } =
    useNewApiKeyDialog(config);

  return (
    <Dialog open={config.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={PANEL_DIALOG_CLASS}>
        <DialogHeader className="text-left">
          <DialogTitle className={PANEL_DIALOG_TITLE_CLASS}>
            Nova chave de API
          </DialogTitle>
          <DialogDescription className={PANEL_TEXT_CLASS}>
            O nome é para você saber onde a chave está em uso. Ela enxerga só
            esta loja.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            noValidate
            onSubmit={handleSubmit}
            aria-label="Nova chave de API"
            className="grid gap-3.5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={PANEL_FIELD_LABEL_CLASS}>
                    Nome
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: Site da loja"
                      autoComplete="off"
                      maxLength={80}
                      className={PANEL_FIELD_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Criando...
                  </>
                ) : (
                  'Criar chave'
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
