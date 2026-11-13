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
import { Info } from 'lucide-react';
import {
  MANAGEMENT_ACTIONS_CLASS,
  MANAGEMENT_BUTTON_CLASS,
  MANAGEMENT_DANGER_BUTTON_CLASS,
  MANAGEMENT_DIALOG_CLASS,
  MANAGEMENT_DIALOG_TITLE_CLASS,
  MANAGEMENT_ERROR_CLASS,
  MANAGEMENT_FIELD_LABEL_CLASS,
  MANAGEMENT_NOTE_CLASS,
  MANAGEMENT_NOTE_ICON_CLASS,
  MANAGEMENT_TEXTAREA_CLASS,
} from '../../../cash-module.styles';
import {
  MAX_VOID_REASON_LENGTH,
  useVoidPaymentDialog,
} from './void-payment-dialog.hook';
import type { TVoidPaymentDialogConfig } from './void-payment-dialog.types';

export const VoidPaymentDialog = (config: TVoidPaymentDialogConfig) => {
  const {
    isOpen,
    description,
    reason,
    setReason,
    error,
    isSubmitting,
    handleOpenChange,
    handleSubmit,
  } = useVoidPaymentDialog(config);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={MANAGEMENT_DIALOG_CLASS}>
        <DialogHeader className="text-left">
          <DialogTitle className={MANAGEMENT_DIALOG_TITLE_CLASS}>
            Estornar pagamento
          </DialogTitle>
          <DialogDescription className="text-sm font-semibold text-[#0B0B0F]">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit}
          aria-label="Estornar pagamento"
          className="grid gap-4"
        >
          <div className={MANAGEMENT_NOTE_CLASS}>
            <Info aria-hidden="true" className={MANAGEMENT_NOTE_ICON_CLASS} />
            <p>
              Estornar marca o pagamento, sem apagar: ele deixa de contar nos
              totais do caixa. Depois de fechar o caixa não dá mais para
              estornar.
            </p>
          </div>

          <label className={MANAGEMENT_FIELD_LABEL_CLASS}>
            Motivo
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={MAX_VOID_REASON_LENGTH}
              placeholder="Ex.: registrado em dobro"
              aria-invalid={!!error || undefined}
              className={MANAGEMENT_TEXTAREA_CLASS}
            />
          </label>

          {error ? (
            <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
              {error}
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
              className={cn(
                MANAGEMENT_BUTTON_CLASS,
                MANAGEMENT_DANGER_BUTTON_CLASS,
              )}
            >
              {isSubmitting ? <Spinner className="size-4" /> : null}
              Estornar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
