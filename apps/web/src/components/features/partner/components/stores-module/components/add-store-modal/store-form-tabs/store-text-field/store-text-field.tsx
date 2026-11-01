import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@repo/ui';
import { useFormContext } from 'react-hook-form';
import {
  STORES_FIELD_CLASS,
  STORES_HINT_CLASS,
  STORES_LABEL_CLASS,
} from '../../../../stores-module.styles';
import type { TStoreFormSchema } from '../store-form.schema';
import type { TStoreTextFieldConfig } from './store-text-field.types';

export const StoreTextField = ({
  name,
  label,
  placeholder,
  hint,
  type = 'text',
}: TStoreTextFieldConfig) => {
  const form = useFormContext<TStoreFormSchema>();

  return (
    <FormField
      name={name}
      control={form.control}
      render={({ field }) => (
        <FormItem className="min-w-0 gap-1.5">
          <FormLabel className={STORES_LABEL_CLASS}>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ''}
              type={type}
              placeholder={placeholder}
              className={STORES_FIELD_CLASS}
            />
          </FormControl>
          {hint ? (
            <FormDescription className={STORES_HINT_CLASS}>{hint}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
