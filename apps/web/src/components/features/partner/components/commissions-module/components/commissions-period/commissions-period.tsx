import { cn } from '@repo/ui';
import {
  MANAGEMENT_ERROR_CLASS,
  MANAGEMENT_FIELD_CLASS,
  MANAGEMENT_FIELD_LABEL_CLASS,
  MANAGEMENT_SEGMENT_ACTIVE_CLASS,
  MANAGEMENT_SEGMENT_CLASS,
  MANAGEMENT_SEGMENTED_CLASS,
} from '../../../cash-module/cash-module.styles';
import type { TCommissionsPeriodConfig } from './commissions-period.types';

const SHORTCUTS = [
  { id: 'this-month', label: 'Este mês' },
  { id: 'last-month', label: 'Mês passado' },
] as const;

export const CommissionsPeriod = ({
  period,
  shortcut,
  periodError,
  handleFromChange,
  handleToChange,
  handleShortcut,
}: TCommissionsPeriodConfig) => (
  <div className="grid gap-2">
    <div className="flex flex-wrap items-end gap-2.5">
      <label className={MANAGEMENT_FIELD_LABEL_CLASS}>
        De
        <input
          type="date"
          value={period.from}
          max={period.to || undefined}
          onChange={(event) => handleFromChange(event.target.value)}
          aria-invalid={!!periodError || undefined}
          className={cn(MANAGEMENT_FIELD_CLASS, 'w-auto')}
        />
      </label>
      <label className={MANAGEMENT_FIELD_LABEL_CLASS}>
        Até
        <input
          type="date"
          value={period.to}
          min={period.from || undefined}
          onChange={(event) => handleToChange(event.target.value)}
          aria-invalid={!!periodError || undefined}
          className={cn(MANAGEMENT_FIELD_CLASS, 'w-auto')}
        />
      </label>
      <div
        role="group"
        aria-label="Atalhos de período"
        className={cn(MANAGEMENT_SEGMENTED_CLASS, 'self-end')}
      >
        {SHORTCUTS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={shortcut === item.id}
            onClick={() => handleShortcut(item.id)}
            className={cn(
              MANAGEMENT_SEGMENT_CLASS,
              shortcut === item.id && MANAGEMENT_SEGMENT_ACTIVE_CLASS,
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
    {periodError ? (
      <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
        {periodError}
      </p>
    ) : null}
  </div>
);
