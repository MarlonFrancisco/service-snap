'use client';

import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@repo/ui';
import { Controller } from 'react-hook-form';
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHOD_OPTIONS,
} from '../../../cash-module.helpers';
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
  MANAGEMENT_SELECT_CLASS,
  MANAGEMENT_TEXTAREA_CLASS,
} from '../../../cash-module.styles';
import { useRegisterPaymentDialog } from './register-payment-dialog.hook';
import { MAX_PAYMENT_NOTES_LENGTH } from './register-payment-dialog.schema';
import type { TRegisterPaymentDialogConfig } from './register-payment-dialog.types';

export const RegisterPaymentDialog = ({
  formatMoney,
  ...config
}: TRegisterPaymentDialogConfig) => {
  const {
    form,
    errors,
    submitError,
    isSubmitting,
    handleOpenChange,
    handleSubmit,
  } = useRegisterPaymentDialog(config);

  return (
    <Dialog open={config.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={MANAGEMENT_DIALOG_CLASS}>
        <DialogHeader className="text-left">
          <DialogTitle className={MANAGEMENT_DIALOG_TITLE_CLASS}>
            Registrar pagamento
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5F5C6E]">
            Pagamento avulso, como o acerto de um atendimento antigo. Entra no
            caixa aberto. O ServiceSnap não cobra o cliente: aqui você só anota
            o que recebeu.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit}
          aria-label="Registrar pagamento"
          className="grid gap-4"
        >
          <div className="grid gap-3.5 sm:grid-cols-[1fr_160px]">
            <div className={MANAGEMENT_FIELD_LABEL_CLASS}>
              <span id="register-payment-method">Forma de pagamento</span>
              <Controller
                control={form.control}
                name="method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-labelledby="register-payment-method"
                      className={MANAGEMENT_SELECT_CLASS}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={PARTNER_PORTAL_CLASS}>
                      {PAYMENT_METHOD_OPTIONS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {PAYMENT_METHOD_LABEL[method]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <label className={MANAGEMENT_FIELD_LABEL_CLASS}>
              Valor
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={formatMoney(0)}
                aria-invalid={!!errors.amount || undefined}
                className={MANAGEMENT_FIELD_CLASS}
                {...form.register('amount')}
              />
            </label>
          </div>
          {errors.amount ? (
            <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
              {errors.amount.message}
            </p>
          ) : null}

          <label className={MANAGEMENT_FIELD_LABEL_CLASS}>
            <span>
              Observação{' '}
              <span className={MANAGEMENT_FIELD_HINT_CLASS}>Opcional</span>
            </span>
            <textarea
              maxLength={MAX_PAYMENT_NOTES_LENGTH}
              placeholder="Ex.: acerto do corte de sexta"
              aria-invalid={!!errors.notes || undefined}
              className={MANAGEMENT_TEXTAREA_CLASS}
              {...form.register('notes')}
            />
          </label>
          {errors.notes ? (
            <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
              {errors.notes.message}
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
              Registrar pagamento
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
