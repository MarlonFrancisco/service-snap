import {
  cn,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui';
import { useFormContext } from 'react-hook-form';
import {
  STORES_HINT_CLASS,
  STORES_LABEL_CLASS,
} from '../../../../stores-module.styles';
import type { TStoreFormSchema } from '../store-form.schema';
import type { TRuleNumberFieldConfig } from './schedule-rules-tab.types';

export const RuleNumberField = ({
  name,
  label,
  hint,
  unit,
  min,
  max,
  step = 1,
}: TRuleNumberFieldConfig) => {
  const form = useFormContext<TStoreFormSchema>();

  return (
    <FormField
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem className="min-w-0 content-start gap-1.5">
          <FormLabel className={STORES_LABEL_CLASS}>{label}</FormLabel>
          <div
            className={cn(
              'flex h-[50px] items-center overflow-hidden rounded-[14px] border border-[#E3E1EA] bg-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0B0B0F]',
              fieldState.invalid && 'border-[1.5px] border-[#A4231A]',
            )}
          >
            <FormControl>
              <input
                ref={field.ref}
                name={field.name}
                onBlur={field.onBlur}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                step={step}
                value={Number.isNaN(field.value) ? '' : field.value}
                onChange={(event) => field.onChange(event.target.valueAsNumber)}
                className="h-12 min-w-0 flex-1 border-0 bg-transparent px-3.5 text-[15px] font-medium text-[#0B0B0F] outline-none"
              />
            </FormControl>
            <span
              aria-hidden="true"
              className="shrink-0 px-3.5 text-sm font-semibold text-[#5F5C6E]"
            >
              {unit}
            </span>
          </div>
          <FormDescription className={STORES_HINT_CLASS}>{hint}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
