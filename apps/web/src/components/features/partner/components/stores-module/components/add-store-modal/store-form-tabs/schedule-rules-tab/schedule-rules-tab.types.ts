import type { TStoreFormSchema } from '../store-form.schema';

export type TScheduleRuleOption = {
  value: number;
  label: string;
};

export type TScheduleRuleSelectName = Extract<
  keyof TStoreFormSchema,
  'slotIntervalMinutes' | 'minAdvanceMinutes' | 'maxAdvanceDays'
>;

export type TScheduleRuleNumberName = Extract<
  keyof TStoreFormSchema,
  'bufferMinutes' | 'cancellationNoticeHours' | 'rescheduleNoticeHours'
>;

export type TRuleSelectFieldConfig = {
  name: TScheduleRuleSelectName;
  label: string;
  hint: string;
  options: readonly TScheduleRuleOption[];
  /** Rótulo de um valor salvo que não está na lista (ex.: gravado pela API). */
  formatValue: (value: number) => string;
};

export type TRuleNumberFieldConfig = {
  name: TScheduleRuleNumberName;
  label: string;
  hint: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
};

export type TScheduleRulesPreview = {
  booking: string;
  policy: string;
};

export type TScheduleRulesValues = Pick<
  TStoreFormSchema,
  | 'slotIntervalMinutes'
  | 'minAdvanceMinutes'
  | 'maxAdvanceDays'
  | 'cancellationNoticeHours'
  | 'rescheduleNoticeHours'
>;
