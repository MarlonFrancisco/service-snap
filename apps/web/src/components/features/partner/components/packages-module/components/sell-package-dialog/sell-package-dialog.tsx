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
} from '@repo/ui';
import { Plus, Search } from 'lucide-react';
import { FormProvider } from 'react-hook-form';
import { PAYMENT_METHOD_OPTIONS } from '../../packages-module.helpers';
import {
  RETENTION_ALERT_CLASS,
  RETENTION_BUTTON_CLASS,
  RETENTION_BUTTON_ICON_CLASS,
  RETENTION_CHECK_CLASS,
  RETENTION_CHECK_INPUT_CLASS,
  RETENTION_DIALOG_ACTIONS_CLASS,
  RETENTION_DIALOG_CLASS,
  RETENTION_DIALOG_TITLE_CLASS,
  RETENTION_ERROR_CLASS,
  RETENTION_FIELD_CLASS,
  RETENTION_HINT_CLASS,
  RETENTION_LABEL_CLASS,
  RETENTION_PRIMARY_BUTTON_CLASS,
  RETENTION_SELECT_CLASS,
  RETENTION_SMALL_BUTTON_CLASS,
  RETENTION_SUBTITLE_CLASS,
} from '../../packages-module.styles';
import { useSellPackageDialog } from './sell-package-dialog.hook';
import type { TSellPackageDialogConfig } from './sell-package-dialog.types';

const NEW_CUSTOMER_FIELDS = [
  { name: 'newCustomer.firstName', label: 'Nome', type: 'text' },
  { name: 'newCustomer.lastName', label: 'Sobrenome', type: 'text' },
  { name: 'newCustomer.telephone', label: 'Telefone', type: 'tel' },
  { name: 'newCustomer.email', label: 'E-mail', type: 'email' },
] as const;

const NOTICE_CLASS =
  'rounded-[14px] bg-[#F7F6FA] px-3.5 py-3 text-[13px] font-medium text-[#5F5C6E]';

const OPTION_CLASS =
  'flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl border border-[#E3E1EA] px-3.5 py-2 transition-colors hover:bg-[#F7F6FA] has-[:checked]:border-[#0B0B0F] has-[:checked]:bg-[#F7F6FA] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#0B0B0F]';

export const SellPackageDialog = (config: TSellPackageDialogConfig) => {
  const {
    form,
    isOpen,
    title,
    summary,
    customerMode,
    handleCustomerModeChange,
    search,
    setSearch,
    customerOptions,
    emptySearchMessage,
    selectedCustomer,
    handleSelectCustomer,
    isSearching,
    isSearchError,
    customerError,
    isPaymentDisabled,
    submitError,
    isSubmitting,
    handleOpenChange,
    handleSubmit,
  } = useSellPackageDialog(config);

  const renderResults = () => {
    if (isSearching) {
      return <p className={NOTICE_CLASS}>Buscando clientes...</p>;
    }
    if (isSearchError) {
      return (
        <p role="alert" className={NOTICE_CLASS}>
          Não foi possível buscar os clientes. Tente de novo ou use Cliente
          novo.
        </p>
      );
    }

    if (customerOptions.length === 0) {
      return <p className={NOTICE_CLASS}>{emptySearchMessage}</p>;
    }

    return (
      <div
        role="radiogroup"
        aria-label="Clientes encontrados"
        aria-invalid={!!customerError || undefined}
        className="grid gap-2"
      >
        {customerOptions.map((option) => (
          <label key={option.id} className={OPTION_CLASS}>
            <input
              type="radio"
              name="sell-package-customer"
              value={option.id}
              checked={option.id === selectedCustomer?.id}
              onChange={() => handleSelectCustomer(option)}
              className="size-5 shrink-0 accent-[#0B0B0F]"
            />
            <span className="min-w-0">
              <b className="block text-sm font-bold break-words">
                {option.name}
              </b>
              <span className="mt-0.5 block text-[13px] font-medium break-all text-[#5F5C6E]">
                {option.contact}
              </span>
            </span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={RETENTION_DIALOG_CLASS}>
        <DialogHeader className="text-left">
          <DialogTitle className={RETENTION_DIALOG_TITLE_CLASS}>
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Escolha o cliente, o valor cobrado e o que ele pagou agora.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            noValidate
            onSubmit={handleSubmit}
            aria-label={title}
            className="grid gap-4"
          >
            {customerMode === 'existing' ? (
              <div className="grid gap-2.5">
                <label className={RETENTION_LABEL_CLASS}>
                  Cliente
                  <span className="relative">
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute top-3.5 left-3.5 size-[18px] stroke-2 text-[#5F5C6E]"
                    />
                    <Input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Buscar por nome, e-mail ou telefone"
                      autoComplete="off"
                      className={cn(RETENTION_FIELD_CLASS, 'pl-10')}
                    />
                  </span>
                </label>
                {renderResults()}
                {customerError ? (
                  <p role="alert" className={RETENTION_ERROR_CLASS}>
                    {customerError}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleCustomerModeChange('new')}
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
                  Cliente novo
                </button>
              </div>
            ) : (
              <fieldset className="m-0 grid min-w-0 gap-3 border-0 p-0">
                <legend className={cn(RETENTION_SUBTITLE_CLASS, 'mb-1')}>
                  Cliente novo
                </legend>
                <p className={cn('text-[13px]', RETENTION_HINT_CLASS)}>
                  Precisa de nome e de telefone ou e-mail.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {NEW_CUSTOMER_FIELDS.map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={item.name}
                      render={({ field }) => (
                        <FormItem className="gap-1.5">
                          <FormLabel className={RETENTION_LABEL_CLASS}>
                            {item.label}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type={item.type}
                              autoComplete="off"
                              className={RETENTION_FIELD_CLASS}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleCustomerModeChange('existing')}
                  className={cn(
                    RETENTION_BUTTON_CLASS,
                    RETENTION_SMALL_BUTTON_CLASS,
                    'justify-self-start',
                  )}
                >
                  <Search
                    aria-hidden="true"
                    className={RETENTION_BUTTON_ICON_CLASS}
                  />
                  Buscar cliente cadastrado
                </button>
              </fieldset>
            )}

            <dl className="m-0 grid gap-2.5 text-sm">
              {summary.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt className="text-[#5F5C6E]">{row.label}</dt>
                  <dd className="m-0 text-right font-semibold">{row.value}</dd>
                </div>
              ))}
            </dl>

            <FormField
              control={form.control}
              name="pricePaid"
              render={({ field }) => (
                <FormItem className="gap-1.5">
                  <FormLabel className={RETENTION_LABEL_CLASS}>
                    Valor cobrado
                    <span className={RETENTION_HINT_CLASS}>
                      Para desconto, mude aqui
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      inputMode="decimal"
                      autoComplete="off"
                      className={RETENTION_FIELD_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <fieldset className="m-0 grid min-w-0 gap-2.5 border-0 p-0">
              <legend className={cn(RETENTION_SUBTITLE_CLASS, 'mb-2.5')}>
                Pagamento recebido agora
              </legend>
              <div className="grid grid-cols-[minmax(0,1fr)_150px] items-start gap-3.5">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="gap-1.5">
                      <FormLabel className="sr-only">
                        Forma de pagamento
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPaymentDisabled}
                      >
                        <FormControl>
                          <SelectTrigger className={RETENTION_SELECT_CLASS}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={PARTNER_PORTAL_CLASS}>
                          {PAYMENT_METHOD_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentAmount"
                  render={({ field }) => (
                    <FormItem className="gap-1.5">
                      <FormLabel className="sr-only">Valor</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="decimal"
                          autoComplete="off"
                          disabled={isPaymentDisabled}
                          className={RETENTION_FIELD_CLASS}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="payLater"
                render={({ field }) => (
                  <label className={RETENTION_CHECK_CLASS}>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className={RETENTION_CHECK_INPUT_CLASS}
                    />
                    Cliente vai pagar depois
                  </label>
                )}
              />
            </fieldset>

            {submitError ? (
              <p role="alert" className={RETENTION_ALERT_CLASS}>
                {submitError}
              </p>
            ) : null}

            <div className={RETENTION_DIALOG_ACTIONS_CLASS}>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className={RETENTION_BUTTON_CLASS}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={RETENTION_PRIMARY_BUTTON_CLASS}
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Vendendo...
                  </>
                ) : (
                  'Vender pacote'
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
