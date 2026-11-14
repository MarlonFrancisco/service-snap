import {
  RETENTION_SEGMENT_CLASS,
  RETENTION_SEGMENTED_CLASS,
} from '../../packages-module.styles';
import type { TRetentionSegmentedConfig } from './retention-segmented.types';

/** Abas em pílula do desenho, feitas de rádios nativos. */
export const RetentionSegmented = <TValue extends string>({
  name,
  label,
  options,
  value,
  onChange,
  describedBy,
}: TRetentionSegmentedConfig<TValue>) => (
  <div
    role="radiogroup"
    aria-label={label}
    aria-describedby={describedBy}
    className={RETENTION_SEGMENTED_CLASS}
  >
    {options.map((option) => (
      <label key={option.value} className={RETENTION_SEGMENT_CLASS}>
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={option.value === value}
          disabled={option.disabled}
          onChange={() => onChange(option.value)}
          className="sr-only"
        />
        {option.label}
      </label>
    ))}
  </div>
);
