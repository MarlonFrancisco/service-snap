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
  Switch,
  Textarea,
} from '@repo/ui';
import { Plus, Trash2 } from 'lucide-react';
import { FormProvider } from 'react-hook-form';
import {
  RETENTION_ALERT_CLASS,
  RETENTION_BUTTON_CLASS,
  RETENTION_BUTTON_ICON_CLASS,
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
  RETENTION_SWITCH_CLASS,
  RETENTION_TEXTAREA_CLASS,
} from '../../packages-module.styles';
import { usePackageFormDialog } from './package-form-dialog.hook';
import type { TPackageFormDialogConfig } from './package-form-dialog.types';

export const PackageFormDialog = (config: TPackageFormDialogConfig) => {
  const {
    form,
    isEditing,
    title,
    submitLabel,
    validityHint,
    itemFields,
    itemsError,
    canAddItem,
    handleAddItem,
    handleRemoveItem,
    serviceOptions,
    isLoadingServices,
    submitError,
    isSubmitting,
    handleOpenChange,
    handleSubmit,
  } = usePackageFormDialog(config);

  return (
    <Dialog open={config.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(RETENTION_DIALOG_CLASS, 'sm:max-w-[560px]')}>
        <DialogHeader className="text-left">
          <DialogTitle className={RETENTION_DIALOG_TITLE_CLASS}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5F5C6E]">
            Vendido e cobrado fora do app. O ServiceSnap controla o saldo de
            sessões.
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
              name="name"
              render={({ field }) => (
                <FormItem className="gap-1.5">
                  <FormLabel className={RETENTION_LABEL_CLASS}>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: 4 cortes"
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
                Serviços do pacote
              </legend>
              {itemFields.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(0,1fr)_96px_44px] items-start gap-2.5"
                >
                  <FormField
                    control={form.control}
                    name={`items.${index}.serviceId`}
                    render={({ field }) => (
                      <FormItem className="gap-1.5">
                        <FormLabel className="sr-only">
                          Serviço {index + 1}
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoadingServices}
                        >
                          <FormControl>
                            <SelectTrigger className={RETENTION_SELECT_CLASS}>
                              <SelectValue
                                placeholder={
                                  isLoadingServices
                                    ? 'Carregando serviços...'
                                    : 'Escolha o serviço'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className={PARTNER_PORTAL_CLASS}>
                            {serviceOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="gap-1.5">
                        <FormLabel className="sr-only">
                          Sessões do serviço {index + 1}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={100}
                            className={RETENTION_FIELD_CLASS}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={itemFields.length === 1}
                    aria-label={`Tirar o serviço ${index + 1}`}
                    className={cn(
                      RETENTION_BUTTON_CLASS,
                      'size-11 min-h-11 px-0',
                    )}
                  >
                    <Trash2
                      aria-hidden="true"
                      className={RETENTION_BUTTON_ICON_CLASS}
                    />
                  </button>
                </div>
              ))}
              {itemsError ? (
                <p role="alert" className={RETENTION_ERROR_CLASS}>
                  {itemsError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!canAddItem}
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
                Adicionar serviço
              </button>
            </fieldset>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="content-start gap-1.5">
                    <FormLabel className={RETENTION_LABEL_CLASS}>
                      Preço de tabela
                    </FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        placeholder="0,00"
                        autoComplete="off"
                        className={RETENTION_FIELD_CLASS}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validityDays"
                render={({ field }) => (
                  <FormItem className="content-start gap-1.5">
                    <FormLabel className={RETENTION_LABEL_CLASS}>
                      Validade
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        placeholder="Não vence"
                        aria-describedby="package-validity-hint"
                        className={RETENTION_FIELD_CLASS}
                        {...field}
                      />
                    </FormControl>
                    <p
                      id="package-validity-hint"
                      className={cn('text-[13px]', RETENTION_HINT_CLASS)}
                    >
                      {validityHint}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="gap-1.5">
                  <FormLabel className={RETENTION_LABEL_CLASS}>
                    Descrição
                    <span className={RETENTION_HINT_CLASS}>Opcional</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      maxLength={500}
                      placeholder="O que o cliente precisa saber"
                      className={RETENTION_TEXTAREA_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing ? (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 rounded-2xl bg-[#F7F6FA] px-4 py-3.5">
                    <div className="grid gap-0.5">
                      <FormLabel className="text-sm font-bold">
                        À venda
                      </FormLabel>
                      <p className="text-[13px] text-[#5F5C6E]">
                        Pausado sai da venda. Quem já comprou continua usando.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={RETENTION_SWITCH_CLASS}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ) : null}

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
                    Salvando...
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
