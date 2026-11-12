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
  CUSTOMERS_BUTTON_CLASS,
  CUSTOMERS_DIALOG_CLASS,
  CUSTOMERS_DIALOG_TITLE_CLASS,
  CUSTOMERS_FIELD_CLASS,
  CUSTOMERS_FIELD_LABEL_CLASS,
  CUSTOMERS_PRIMARY_BUTTON_CLASS,
} from '../../../customers-module.styles';
import { useNewCustomerDialog } from './new-customer-dialog.hook';
import type { TNewCustomerSchema } from './new-customer-dialog.schema';
import type { TNewCustomerDialogConfig } from './new-customer-dialog.types';

const FIELDS: {
  name: keyof TNewCustomerSchema;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
}[] = [
  {
    name: 'firstName',
    label: 'Nome *',
    type: 'text',
    placeholder: 'Nome',
    autoComplete: 'off',
  },
  {
    name: 'lastName',
    label: 'Sobrenome',
    type: 'text',
    placeholder: 'Sobrenome',
    autoComplete: 'off',
  },
  {
    name: 'telephone',
    label: 'Telefone',
    type: 'tel',
    placeholder: '(00) 00000-0000',
    autoComplete: 'off',
  },
  {
    name: 'email',
    label: 'E-mail',
    type: 'email',
    placeholder: 'email@exemplo.com',
    autoComplete: 'off',
  },
];

export const NewCustomerDialog = (config: TNewCustomerDialogConfig) => {
  const { form, submitError, isSubmitting, handleOpenChange, handleSubmit } =
    useNewCustomerDialog(config);

  return (
    <Dialog open={config.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={CUSTOMERS_DIALOG_CLASS}>
        <DialogHeader className="text-left">
          <DialogTitle className={CUSTOMERS_DIALOG_TITLE_CLASS}>
            Novo cliente
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5F5C6E]">
            Precisa de nome e de telefone ou e-mail. Não precisa ter conta no
            ServiceSnap.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            noValidate
            onSubmit={handleSubmit}
            aria-label="Novo cliente"
            className="grid gap-3.5"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {FIELDS.map((item) => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={CUSTOMERS_FIELD_LABEL_CLASS}>
                        {item.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={item.type}
                          placeholder={item.placeholder}
                          autoComplete={item.autoComplete}
                          className={CUSTOMERS_FIELD_CLASS}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {submitError ? (
              <p
                role="alert"
                className="rounded-[14px] bg-[#FBE8E6] px-3.5 py-3 text-[13px] font-semibold text-[#A4231A]"
              >
                {submitError}
              </p>
            ) : null}

            <div className="mt-1 flex gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className={cn(CUSTOMERS_BUTTON_CLASS, 'flex-1')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(CUSTOMERS_PRIMARY_BUTTON_CLASS, 'flex-1')}
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar cliente'
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
