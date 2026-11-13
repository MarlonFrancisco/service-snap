import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { useFormContext } from 'react-hook-form';
import {
  STORES_HINT_CLASS,
  STORES_LABEL_CLASS,
  STORES_SELECT_TRIGGER_CLASS,
} from '../../../../stores-module.styles';
import type { TStoreFormSchema } from '../store-form.schema';
import { withCurrentOption } from './schedule-rules-tab.helpers';
import type { TRuleSelectFieldConfig } from './schedule-rules-tab.types';

export const RuleSelectField = ({
  name,
  label,
  hint,
  options,
  formatValue,
}: TRuleSelectFieldConfig) => {
  const form = useFormContext<TStoreFormSchema>();

  return (
    <FormField
      name={name}
      control={form.control}
      render={({ field }) => (
        <FormItem className="min-w-0 content-start gap-1.5">
          <FormLabel className={STORES_LABEL_CLASS}>{label}</FormLabel>
          <Select
            value={String(field.value)}
            onValueChange={(value) => field.onChange(Number(value))}
          >
            <FormControl>
              <SelectTrigger
                ref={field.ref}
                onBlur={field.onBlur}
                className={STORES_SELECT_TRIGGER_CLASS}
              >
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent className={PARTNER_PORTAL_CLASS}>
              {withCurrentOption(options, field.value, formatValue).map(
                (option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <FormDescription className={STORES_HINT_CLASS}>{hint}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
