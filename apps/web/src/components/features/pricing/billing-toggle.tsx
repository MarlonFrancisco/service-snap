'use client';
import { cn } from '@repo/ui';
import type { TBillingPeriod } from './pricing.types';

type TBillingToggleConfig = {
  value: TBillingPeriod;
  onChange: (value: TBillingPeriod) => void;
};

const BILLING_OPTIONS: { value: TBillingPeriod; label: string }[] = [
  { value: 'month', label: 'Mensal' },
  { value: 'year', label: 'Anual' },
];

export const BillingToggle = ({ value, onChange }: TBillingToggleConfig) => {
  return (
    <div
      role="group"
      aria-label="Período de cobrança"
      className="inline-flex gap-1 rounded-full border border-[#E3E1EA] p-1"
    >
      {BILLING_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-11 cursor-pointer rounded-full px-[1.375rem] text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]',
            value === option.value
              ? 'bg-[#0B0B0F] text-white'
              : 'bg-transparent text-[#0B0B0F]',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
