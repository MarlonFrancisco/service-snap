import type { TAnamnesisFieldType } from '@/types/api/anamnesis.types';

/** Pergunta sendo escrita (nova) ou editada, antes de entrar na lista. */
export type TAnamnesisQuestionDraft = {
  label: string;
  type: TAnamnesisFieldType;
  required: boolean;
  /** Opções separadas por vírgula, para "uma" ou "várias escolhas". */
  optionsText: string;
};

export type TAnamnesisQuestionDraftConfig = {
  draft: TAnamnesisQuestionDraft;
  onChange: (changes: Partial<TAnamnesisQuestionDraft>) => void;
  isEditing: boolean;
  needsOptions: boolean;
  error?: string;
  onSubmit: () => void;
  onCancelEdit: () => void;
};
