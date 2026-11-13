'use client';

import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@repo/ui';
import { Info } from 'lucide-react';
import { Controller } from 'react-hook-form';
import {
  MANAGEMENT_CARD_CLASS,
  MANAGEMENT_ERROR_CLASS,
  MANAGEMENT_FIELD_CLASS,
  MANAGEMENT_FIELD_LABEL_CLASS,
  MANAGEMENT_NOTE_CLASS,
  MANAGEMENT_NOTE_ICON_CLASS,
  MANAGEMENT_PRIMARY_BUTTON_CLASS,
  MANAGEMENT_SEGMENT_ACTIVE_CLASS,
  MANAGEMENT_SEGMENT_CLASS,
  MANAGEMENT_SEGMENTED_CLASS,
  MANAGEMENT_SELECT_CLASS,
  MANAGEMENT_SUBTITLE_CLASS,
} from '../../../../cash-module/cash-module.styles';
import { useCommissionRuleForm } from './commission-rule-form.hook';
import { ALL_OPTION } from './commission-rule-form.schema';
import type {
  TCommissionRuleFormConfig,
  TCommissionRuleOption,
} from './commission-rule-form.types';

const TYPE_OPTIONS = [
  { id: 'percent', label: 'Percentual' },
  { id: 'fixed', label: 'Valor fixo' },
] as const;

const ScopeSelect = ({
  labelId,
  value,
  onChange,
  options,
}: {
  labelId: string;
  value: string;
  onChange: (value: string) => void;
  options: TCommissionRuleOption[];
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger
      aria-labelledby={labelId}
      className={MANAGEMENT_SELECT_CLASS}
    >
      <SelectValue />
    </SelectTrigger>
    <SelectContent className={PARTNER_PORTAL_CLASS}>
      <SelectItem value={ALL_OPTION}>Todos</SelectItem>
      {options.map((option) => (
        <SelectItem key={option.id} value={option.id}>
          {option.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export const CommissionRuleForm = (config: TCommissionRuleFormConfig) => {
  const {
    form,
    errors,
    type,
    valuePlaceholder,
    memberOptions,
    serviceOptions,
    submitError,
    isSubmitting,
    handleSubmit,
  } = useCommissionRuleForm(config);

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby="commission-rule-form-title"
      className={MANAGEMENT_CARD_CLASS}
    >
      <h3 id="commission-rule-form-title" className={MANAGEMENT_SUBTITLE_CLASS}>
        Nova regra
      </h3>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className={MANAGEMENT_FIELD_LABEL_CLASS}>
          <span id="commission-rule-member">Profissional</span>
          <Controller
            control={form.control}
            name="storeMemberId"
            render={({ field }) => (
              <ScopeSelect
                labelId="commission-rule-member"
                value={field.value}
                onChange={field.onChange}
                options={memberOptions}
              />
            )}
          />
        </div>
        <div className={MANAGEMENT_FIELD_LABEL_CLASS}>
          <span id="commission-rule-service">Serviço</span>
          <Controller
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <ScopeSelect
                labelId="commission-rule-service"
                value={field.value}
                onChange={field.onChange}
                options={serviceOptions}
              />
            )}
          />
        </div>
      </div>

      <fieldset>
        <legend className="sr-only">Tipo</legend>
        <div className={MANAGEMENT_SEGMENTED_CLASS}>
          {TYPE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={cn(
                MANAGEMENT_SEGMENT_CLASS,
                'inline-flex items-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#0B0B0F]',
                type === option.id && MANAGEMENT_SEGMENT_ACTIVE_CLASS,
              )}
            >
              <input
                type="radio"
                value={option.id}
                className="sr-only"
                {...form.register('type')}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className={MANAGEMENT_FIELD_LABEL_CLASS}>
          {type === 'percent' ? 'Valor (%)' : 'Valor por atendimento'}
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder={valuePlaceholder}
            aria-invalid={!!errors.value || undefined}
            className={MANAGEMENT_FIELD_CLASS}
            {...form.register('value')}
          />
        </label>
        <label className={MANAGEMENT_FIELD_LABEL_CLASS}>
          Vale a partir de
          <input
            type="date"
            aria-invalid={!!errors.effectiveFrom || undefined}
            className={MANAGEMENT_FIELD_CLASS}
            {...form.register('effectiveFrom')}
          />
        </label>
      </div>
      {errors.value || errors.effectiveFrom ? (
        <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
          {errors.value?.message ?? errors.effectiveFrom?.message}
        </p>
      ) : null}

      <div className={MANAGEMENT_NOTE_CLASS}>
        <Info aria-hidden="true" className={MANAGEMENT_NOTE_ICON_CLASS} />
        <p>
          Mudar uma regra cria uma versão nova a partir da data escolhida. Meses
          já pagos não mudam.
        </p>
      </div>

      {submitError ? (
        <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={MANAGEMENT_PRIMARY_BUTTON_CLASS}
      >
        {isSubmitting ? <Spinner className="size-4" /> : null}
        Salvar regra
      </button>
    </form>
  );
};
