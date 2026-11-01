import type { HTMLInputTypeAttribute } from 'react';
import type { TStoreFormSchema } from '../store-form.schema';

export type TStoreTextFieldName = Extract<
  keyof TStoreFormSchema,
  | 'name'
  | 'address'
  | 'city'
  | 'state'
  | 'zipCode'
  | 'telephone'
  | 'email'
  | 'website'
  | 'instagram'
  | 'facebook'
  | 'openTime'
  | 'closeTime'
  | 'lunchStartTime'
  | 'lunchEndTime'
>;

export type TStoreTextFieldConfig = {
  name: TStoreTextFieldName;
  label: string;
  placeholder?: string;
  hint?: string;
  type?: HTMLInputTypeAttribute;
};
