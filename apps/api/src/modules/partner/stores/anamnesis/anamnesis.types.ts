export const ANAMNESIS_FIELD_TYPES = [
  'text',
  'textarea',
  'boolean',
  'single_choice',
  'multiple_choice',
  'date',
] as const;

export type TAnamnesisFieldType = (typeof ANAMNESIS_FIELD_TYPES)[number];

/** Pergunta do formulário. O `id` liga a resposta à pergunta entre versões. */
export type TAnamnesisField = {
  id: string;
  label: string;
  type: TAnamnesisFieldType;
  required: boolean;
  options?: string[];
};

export type TAnamnesisAnswerValue = string | boolean | string[] | null;

export type TAnamnesisAnswers = Record<string, TAnamnesisAnswerValue>;

/** O que o link público mostra ao cliente. */
export type TAnamnesisInvite = {
  storeName: string;
  customerFirstName: string | null;
  date: string;
  startTime: string;
  forms: {
    id: string;
    name: string;
    description: string | null;
    version: number;
    fields: TAnamnesisField[];
    submittedAt: Date | null;
  }[];
  consentText: string;
};

/** Link que o cliente recebe sozinho, ligado ao serviço que pede as fichas. */
export type TAnamnesisCustomerLink = {
  scheduleId: string;
  url: string;
  expiresAt: Date;
  forms: { id: string; name: string }[];
};
