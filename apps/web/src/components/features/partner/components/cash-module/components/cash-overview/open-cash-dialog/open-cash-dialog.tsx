'use client';

import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Spinner,
} from '@repo/ui';
import {
  MANAGEMENT_ACTIONS_CLASS,
  MANAGEMENT_BUTTON_CLASS,
  MANAGEMENT_DIALOG_CLASS,
  MANAGEMENT_DIALOG_TITLE_CLASS,
  MANAGEMENT_ERROR_CLASS,
  MANAGEMENT_FIELD_CLASS,
  MANAGEMENT_FIELD_HINT_CLASS,
  MANAGEMENT_FIELD_LABEL_CLASS,
  MANAGEMENT_PRIMARY_BUTTON_CLASS,
} from '../../../cash-module.styles';
import { useOpenCashDialog } from './open-cash-dialog.hook';
import type { TOpenCashDialogConfig } from './open-cash-dialog.types';

export const OpenCashDialog = ({
  formatMoney,
  ...config
}: TOpenCashDialogConfig) => {
  const {
    form,
    errors,
    submitError,
    isSubmitting,
    handleOpenChange,
    handleSubmit,
  } = useOpenCashDialog(config);

  return (
    <Dialog open={config.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={MANAGEMENT_DIALOG_CLASS}>
        <DialogHeader className="text-left">
          <DialogTitle className={MANAGEMENT_DIALOG_TITLE_CLASS}>
            Abrir caixa
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5F5C6E]">
            Informe o troco que já está na gaveta. Os pagamentos registrados a
            partir de agora entram neste caixa.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit}
          aria-label="Abrir caixa"
          className="grid gap-4"
        >
          <label className={MANAGEMENT_FIELD_LABEL_CLASS}>
            Troco inicial
            <span className={MANAGEMENT_FIELD_HINT_CLASS}>
              Deixe em branco se a gaveta está vazia
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={formatMoney(0)}
              aria-invalid={!!errors.openingAmount || undefined}
              className={MANAGEMENT_FIELD_CLASS}
              {...form.register('openingAmount')}
            />
          </label>
          {errors.openingAmount ? (
            <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
              {errors.openingAmount.message}
            </p>
          ) : null}

          {submitError ? (
            <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
              {submitError}
            </p>
          ) : null}

          <div className={cn(MANAGEMENT_ACTIONS_CLASS, 'justify-end')}>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className={MANAGEMENT_BUTTON_CLASS}
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={MANAGEMENT_PRIMARY_BUTTON_CLASS}
            >
              {isSubmitting ? <Spinner className="size-4" /> : null}
              Abrir caixa
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
