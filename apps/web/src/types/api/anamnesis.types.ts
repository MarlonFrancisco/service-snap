export const ANAMNESIS_FIELD_TYPES = [
  'boolean',
  'text',
  'textarea',
  'single_choice',
  'multiple_choice',
  'date',
] as const;

export type TAnamnesisFieldType = (typeof ANAMNESIS_FIELD_TYPES)[number];

/** Pergunta do formulário. O `id` liga a resposta à pergunta entre versões. */
export type TAnamnesisField = {
  /** `a-z`, `0-9`, `_` ou `-`, até 40. */
  id: string;
  label: string;
  type: TAnamnesisFieldType;
  required: boolean;
  options?: string[];
};

export interface IAnamnesisForm {
  id: string;
  name: string;
  description: string | null;
  fields: TAnamnesisField[];
  version: number;
  /** Serviços que pedem a ficha; vazio vale para todos. */
  serviceIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TCreateAnamnesisForm = {
  name: string;
  description?: string;
  fields: TAnamnesisField[];
  serviceIds?: string[];
};

/** Trocar as perguntas sobe a versão do formulário. */
export type TUpdateAnamnesisForm = Partial<TCreateAnamnesisForm> & {
  isActive?: boolean;
};

/** Link sem login para o cliente; vale até o dia seguinte ao atendimento. */
export type TAnamnesisLink = {
  url: string;
  expiresAt: string;
  forms: { id: string; name: string }[];
};

/** Item da ficha do cliente: sem respostas, só qual ficha e de quando. */
export type TCustomerAnamnesisEntry = {
  id: string;
  formName: string;
  formVersion: number;
  submittedAt: string;
  consentAt: string;
  schedule: {
    id: string;
    date: string;
    startTime: string;
    storeMemberId: string | null;
  } | null;
};

export type TAnamnesisAnswerValue = string | boolean | string[] | null;

export type TAnamnesisAnswers = Record<string, TAnamnesisAnswerValue>;

/** Respostas abertas (leitura auditada): dono, gerente ou o profissional. */
export interface IAnamnesisResponse {
  id: string;
  formName: string;
  formVersion: number;
  fields: TAnamnesisField[];
  answers: TAnamnesisAnswers;
  consentAt: string;
  consentText: string;
  submittedAt: string;
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  scheduleId: string | null;
}

export type TAnamnesisInviteForm = {
  id: string;
  name: string;
  description: string | null;
  version: number;
  fields: TAnamnesisField[];
  submittedAt: string | null;
};

/** `GET /anamnesis/:token`: o que a página pública mostra. */
export type TAnamnesisInvite = {
  storeName: string;
  customerFirstName: string | null;
  /** `YYYY-MM-DD` */
  date: string;
  /** `HH:MM` */
  startTime: string;
  forms: TAnamnesisInviteForm[];
  consentText: string;
};

/** `POST /anamnesis/:token`. */
export type TSubmitAnamnesis = {
  formId: string;
  answers: TAnamnesisAnswers;
  consent: true;
};

export type TAnamnesisSubmitted = {
  formId: string;
  submitted: boolean;
};
