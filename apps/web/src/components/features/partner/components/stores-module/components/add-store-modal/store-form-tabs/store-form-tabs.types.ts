import type { TStoreFormSchema } from './store-form.schema';

export type TStoreFormTab =
  | 'basic'
  | 'region'
  | 'contact'
  | 'hours'
  | 'schedule'
  | 'holidays'
  | 'gallery'
  | 'staff';

export type TStoreFormField = keyof TStoreFormSchema;

export type TStoreFormTabDefinition = {
  value: TStoreFormTab;
  label: string;
  requiresSavedStore: boolean;
  fields: readonly TStoreFormField[];
};
