import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form';
import type { TCheckoutSchema } from '../checkout-form.schema';

export type TCheckoutPaymentsConfig = {
  form: UseFormReturn<TCheckoutSchema>;
  fields: FieldArrayWithId<TCheckoutSchema, 'payments', 'id'>[];
  canAdd: boolean;
  amountPlaceholder: string;
  onAmountEdited: () => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};
