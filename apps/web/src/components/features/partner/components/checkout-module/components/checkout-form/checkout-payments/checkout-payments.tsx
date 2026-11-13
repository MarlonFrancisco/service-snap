'use client';

import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { Plus, X } from 'lucide-react';
import { Controller } from 'react-hook-form';
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHOD_OPTIONS,
} from '../../../../cash-module/cash-module.helpers';
import {
  MANAGEMENT_BUTTON_CLASS,
  MANAGEMENT_BUTTON_ICON_CLASS,
  MANAGEMENT_ERROR_CLASS,
  MANAGEMENT_FIELD_CLASS,
  MANAGEMENT_SELECT_CLASS,
  MANAGEMENT_SMALL_BUTTON_CLASS,
  MANAGEMENT_SUBTITLE_CLASS,
} from '../../../../cash-module/cash-module.styles';
import type { TCheckoutPaymentsConfig } from './checkout-payments.types';

const REMOVE_BUTTON_CLASS =
  'grid size-11 flex-none cursor-pointer place-items-center rounded-full bg-[#F4F3F7] text-[#0B0B0F] transition-colors hover:bg-[#EBE9F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

export const CheckoutPayments = ({
  form,
  fields,
  canAdd,
  amountPlaceholder,
  onAmountEdited,
  onAdd,
  onRemove,
}: TCheckoutPaymentsConfig) => {
  const errors = form.formState.errors.payments;

  return (
    <fieldset className="grid gap-2.5">
      <legend className={cn(MANAGEMENT_SUBTITLE_CLASS, 'mb-2.5')}>
        O que a loja recebeu
      </legend>

      {fields.map((field, index) => {
        const amountError = errors?.[index]?.amount?.message;

        return (
          <div key={field.id} className="grid gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="grid min-w-0 flex-1 gap-2.5 sm:grid-cols-[1fr_160px]">
                <Controller
                  control={form.control}
                  name={`payments.${index}.method`}
                  render={({ field: methodField }) => (
                    <Select
                      value={methodField.value}
                      onValueChange={methodField.onChange}
                    >
                      <SelectTrigger
                        aria-label={`Forma de pagamento ${index + 1}`}
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
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  aria-label={`Valor ${index + 1}`}
                  placeholder={amountPlaceholder}
                  aria-invalid={!!amountError || undefined}
                  className={MANAGEMENT_FIELD_CLASS}
                  {...form.register(`payments.${index}.amount`, {
                    onChange: onAmountEdited,
                  })}
                />
              </div>
              {fields.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  aria-label={`Remover forma de pagamento ${index + 1}`}
                  className={REMOVE_BUTTON_CLASS}
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              ) : null}
            </div>
            {amountError ? (
              <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
                {amountError}
              </p>
            ) : null}
          </div>
        );
      })}

      {canAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            MANAGEMENT_BUTTON_CLASS,
            MANAGEMENT_SMALL_BUTTON_CLASS,
            'justify-self-start',
          )}
        >
          <Plus aria-hidden="true" className={MANAGEMENT_BUTTON_ICON_CLASS} />
          Outra forma
        </button>
      ) : null}
    </fieldset>
  );
};
