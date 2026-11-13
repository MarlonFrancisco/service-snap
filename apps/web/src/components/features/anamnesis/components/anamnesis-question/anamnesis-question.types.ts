import type { TAnamnesisField } from '@/types/api/anamnesis.types';
import type { Control } from 'react-hook-form';
import type { TAnamnesisFormValues } from '../../anamnesis.types';

export type TAnamnesisQuestionConfig = {
  /** Prefixo dos ids, para mais de uma ficha na mesma página. */
  formId: string;
  field: TAnamnesisField;
  control: Control<TAnamnesisFormValues>;
};
