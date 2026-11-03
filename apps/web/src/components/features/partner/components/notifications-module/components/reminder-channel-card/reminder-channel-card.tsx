'use client';

import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Switch,
  Textarea,
} from '@repo/ui';
import { Lock } from 'lucide-react';
import { useId } from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import { PARTNER_PORTAL_CLASS } from '../../../../partner.styles';
import {
  MODULE_ACTION_CLASS,
  MODULE_FIELD_CLASS,
  MODULE_FIELD_LABEL_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
  MODULE_RAISED_CARD_CLASS,
} from '../../notifications-module.styles';
import { useReminderChannelCard } from './reminder-channel-card.hook';
import type { TReminderChannelCardConfig } from './reminder-channel-card.types';

export const ReminderChannelCard = <TFormValues extends FieldValues>({
  icon: Icon,
  title,
  description,
  enabledName,
  timingName,
  messageName,
  timingOptions,
  messageLimit,
  messageHint,
  messagePlaceholder,
  previewLabel,
  onOpenPreview,
  isSaving,
  onSubmit,
  lockedHint,
}: TReminderChannelCardConfig<TFormValues>) => {
  const lockedHintId = useId();
  const { control, isEnabled, messageLength, enabledLabel, isLocked } =
    useReminderChannelCard<TFormValues>({
      enabledName,
      messageName,
      lockedHint,
    });

  return (
    <form
      onSubmit={onSubmit}
      aria-describedby={isLocked ? lockedHintId : undefined}
      className={MODULE_RAISED_CARD_CLASS}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F4F3F7]"
          >
            <Icon className="size-5 stroke-[1.8]" />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold">{title}</h3>
            <p className="mt-0.5 text-sm text-[#5F5C6E]">{description}</p>
          </div>
        </div>
        <Controller
          control={control}
          name={enabledName}
          render={({ field }) => (
            <label
              className={cn(
                'flex min-h-11 items-center gap-2 text-sm font-semibold',
                isLocked
                  ? 'cursor-not-allowed text-[#5F5C6E]'
                  : 'cursor-pointer',
              )}
            >
              <Switch
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={isLocked}
                aria-label={title}
              />
              {enabledLabel}
            </label>
          )}
        />
      </div>

      {isLocked ? (
        <p
          id={lockedHintId}
          className="flex items-center gap-2 rounded-[14px] bg-[#F7F6FA] px-3.5 py-3 text-[13px] font-semibold text-[#5F5C6E]"
        >
          <Lock aria-hidden="true" className="size-4 flex-none stroke-2" />
          {lockedHint}
        </p>
      ) : null}

      {isEnabled && !isLocked ? (
        <>
          <FormField
            control={control}
            name={timingName}
            render={({ field }) => (
              <FormItem className="gap-1.5">
                <FormLabel className={MODULE_FIELD_LABEL_CLASS}>
                  Tempo de antecedência
                </FormLabel>
                <Select
                  value={String(field.value ?? '')}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        MODULE_FIELD_CLASS,
                        'data-[size=default]:h-[50px]',
                      )}
                    >
                      <SelectValue placeholder="Selecione o tempo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={PARTNER_PORTAL_CLASS}>
                    {timingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
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
            control={control}
            name={messageName}
            render={({ field }) => (
              <FormItem className="gap-1.5">
                <FormLabel className={MODULE_FIELD_LABEL_CLASS}>
                  Mensagem personalizada (opcional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={String(field.value ?? '')}
                    placeholder={messagePlaceholder}
                    maxLength={messageLimit}
                    className={cn(
                      MODULE_FIELD_CLASS,
                      'h-auto min-h-[100px] resize-none py-3',
                    )}
                  />
                </FormControl>
                <div className="flex flex-wrap justify-between gap-2 text-[13px] font-medium text-[#5F5C6E]">
                  <span>{messageHint}</span>
                  <span>
                    {messageLength}/{messageLimit}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ) : null}

      {/* Celular: salvar em cima, os dois em largura total. */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <button
          type="button"
          onClick={onOpenPreview}
          className={cn(
            MODULE_ACTION_CLASS,
            'min-h-12 w-full px-5 text-sm sm:w-auto',
          )}
        >
          {previewLabel}
        </button>
        <button
          type="submit"
          disabled={isSaving || isLocked}
          className={cn(
            MODULE_PRIMARY_ACTION_CLASS,
            'min-h-12 w-full px-5 text-sm disabled:cursor-not-allowed disabled:bg-[#EBE9F0] disabled:text-[#5F5C6E] sm:w-auto',
          )}
        >
          {isSaving ? (
            <>
              <Spinner />
              Salvando...
            </>
          ) : (
            'Salvar configurações'
          )}
        </button>
      </div>
    </form>
  );
};
