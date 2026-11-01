'use client';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui';

interface IBillingToggleProps {
  value: 'month' | 'year';
  onChange: (value: 'month' | 'year') => void;
}

export const BillingToggle = ({ value, onChange }: IBillingToggleProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(newValue) => {
          if (newValue) onChange(newValue as 'month' | 'year');
        }}
        className="rounded-2xl bg-[#F4F4F5] p-1"
      >
        <ToggleGroupItem
          value="month"
          aria-label="Planos mensais"
          className="rounded-xl px-8 py-2.5 text-sm font-semibold text-[#2B2B2B] data-[state=on]:bg-[#0A0A0A] data-[state=on]:text-white data-[state=on]:shadow-sm"
        >
          Mensal
        </ToggleGroupItem>
        <ToggleGroupItem
          value="year"
          aria-label="Planos anuais"
          className="rounded-xl px-8 py-2.5 text-sm font-semibold text-[#2B2B2B] data-[state=on]:bg-[#0A0A0A] data-[state=on]:text-white data-[state=on]:shadow-sm"
        >
          Anual
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
