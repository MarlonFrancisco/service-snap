import type { IAnamnesisForm } from '@/types/api/anamnesis.types';
import type { TAnamnesisServiceOption } from '../../../anamnesis-module.types';

export type TAnamnesisFormEditorConfig = {
  /** Ficha salva que está sendo editada; `null` cria uma nova. */
  form: IAnamnesisForm | null;
  storeId: string;
  serviceOptions: TAnamnesisServiceOption[];
  onSaved: (form: IAnamnesisForm) => void;
};

/** Pergunta como aparece na lista do editor. */
export type TAnamnesisQuestionRow = {
  key: string;
  label: string;
  meta: string;
  optionsLabel: string | null;
  isEditing: boolean;
};
