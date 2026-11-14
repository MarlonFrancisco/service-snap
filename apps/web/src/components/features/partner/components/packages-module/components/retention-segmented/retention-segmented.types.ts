export type TRetentionSegmentedOption<TValue extends string> = {
  value: TValue;
  label: string;
  disabled?: boolean;
};

export type TRetentionSegmentedConfig<TValue extends string> = {
  /** Nome do grupo de rádios (único na tela). */
  name: string;
  /** Rótulo acessível do grupo. */
  label: string;
  options: readonly TRetentionSegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  describedBy?: string;
};
