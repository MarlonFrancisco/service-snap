import type { TUpdateAnamnesisForm } from '@/types/api/anamnesis.types';

export type TUseAnamnesisMutationsConfig = {
  storeId: string;
};

export type TUpdateAnamnesisFormVariables = {
  formId: string;
  changes: TUpdateAnamnesisForm;
};

export type TDeleteAnamnesisResponseVariables = {
  responseId: string;
  customerId: string;
};
